// Direct upload to storage, the ActiveStorage way: hash the file in the
// browser, ask the backend for a signed URL (POST /api/v1/uploads), PUT the
// bytes straight to the bucket, keep the signed id. The signed id is what
// creator applications and products reference afterwards.
//
// Production storage needs CORS allowing PUT from the storefront's origin with
// the Content-MD5, Content-Type and Content-Disposition headers; without it
// the PUT fails with status 0 and the message below says so.

import { ApiError, v1 } from "../api/v1";
import { md5BlobBase64 } from "./md5";

export type UploadGroup = "audio" | "image" | "json";

const KB = 1024;
const MB = 1024 * KB;

/**
 * Per-file limits. They mirror the backend's default Uploads.config rules; a
 * fork that changes those rules on the backend changes them here too.
 */
export const UPLOAD_RULES: Record<
  UploadGroup,
  { max: number; maxLabel: string; types: Record<string, string> }
> = {
  audio: {
    max: 50 * MB,
    maxLabel: "50 MB",
    types: {
      wav: "audio/wav",
      wave: "audio/wav",
      aif: "audio/aiff",
      aiff: "audio/aiff",
      flac: "audio/flac",
      mp3: "audio/mpeg"
    }
  },
  image: {
    max: 10 * MB,
    maxLabel: "10 MB",
    types: {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      webp: "image/webp"
    }
  },
  json: {
    max: 256 * KB,
    maxLabel: "256 KB",
    types: { json: "application/json" }
  }
};

const TYPE_ALIASES: Record<string, string> = {
  "audio/x-wav": "audio/wav",
  "audio/wave": "audio/wav",
  "audio/vnd.wave": "audio/wav",
  "audio/x-aiff": "audio/aiff",
  "audio/x-flac": "audio/flac",
  "audio/mp3": "audio/mpeg",
  "image/jpg": "image/jpeg"
};

export const extensionOf = (name: string): string =>
  (name.split(".").pop() || "").toLowerCase();

const groupOf = (name: string): UploadGroup | null => {
  const ext = extensionOf(name);
  for (const group of Object.keys(UPLOAD_RULES) as UploadGroup[]) {
    if (UPLOAD_RULES[group].types[ext]) return group;
  }
  return null;
};

/** The content type to declare: by extension, so the backend's allowlist matches. */
export function contentTypeFor(
  name: string,
  browserType: string
): string | null {
  const group = groupOf(name);
  if (group) return UPLOAD_RULES[group].types[extensionOf(name)];
  const t = (browserType || "").toLowerCase();
  return TYPE_ALIASES[t] || t || null;
}

/** `accept` lists for <input type=file>, per group. */
export const acceptFor = (groups: UploadGroup[]): string =>
  groups
    .flatMap((g) => Object.keys(UPLOAD_RULES[g].types).map((e) => `.${e}`))
    .join(",");

const allExtensions = (): string => {
  const exts = (Object.keys(UPLOAD_RULES) as UploadGroup[]).flatMap((g) =>
    Object.keys(UPLOAD_RULES[g].types).map((e) => e.toUpperCase())
  );
  return `${exts.slice(0, -1).join(", ")} or ${exts[exts.length - 1]}`;
};

/** A reason the file can't be uploaded, or null when it can. */
export function checkUpload(
  f: { name: string; size: number },
  allowed?: UploadGroup[]
): string | null {
  const group = groupOf(f.name);
  if (!group) return `${f.name} can't be uploaded. Use ${allExtensions()}.`;
  if (allowed && !allowed.includes(group))
    return `${f.name} can't be uploaded here.`;
  if (f.size <= 0) return `${f.name} is empty.`;
  if (f.size > UPLOAD_RULES[group].max)
    return `${f.name} is over the ${UPLOAD_RULES[group].maxLabel} limit.`;
  return null;
}

export interface UploadProgress {
  phase: "hash" | "upload" | "done";
  /** 0..1 over the whole upload (hashing counts as the first 15%). */
  fraction: number;
}

type Put = (
  url: string,
  body: Blob,
  headers: Record<string, string>,
  onProgress: (loaded: number, total: number) => void,
  signal?: AbortSignal
) => Promise<void>;

export class UploadError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "UploadError";
    this.status = status;
  }
}

/** PUT with XHR: fetch can't report upload progress. */
export const xhrPut: Put = (url, body, headers, onProgress, signal) =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new UploadError(0, "Upload cancelled."));
      return;
    }
    const xhr = new XMLHttpRequest();
    const onAbort = () => xhr.abort();
    const done = () => signal?.removeEventListener("abort", onAbort);
    xhr.open("PUT", url);
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded, e.total);
    };
    xhr.onload = () => {
      done();
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else
        reject(
          new UploadError(
            xhr.status,
            `Storage refused the file (${xhr.status}).`
          )
        );
    };
    xhr.onerror = () => {
      done();
      reject(
        new UploadError(
          0,
          "The upload didn't reach storage. Check your connection; if it keeps failing, storage may not accept uploads from this site yet."
        )
      );
    };
    xhr.onabort = () => {
      done();
      reject(new UploadError(0, "Upload cancelled."));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
    xhr.send(body);
  });

interface DirectUpload {
  signed_id: string;
  direct_upload: { url: string; headers: Record<string, string> };
}

const HASH_SHARE = 0.15;

export async function uploadFile(
  file: Blob & { name: string },
  token: string | null | undefined,
  onProgress?: (p: UploadProgress) => void,
  opts: { put?: Put; signal?: AbortSignal; allowed?: UploadGroup[] } = {}
): Promise<{ signedId: string }> {
  const problem = checkUpload(file, opts.allowed);
  if (problem) throw new UploadError(422, problem);

  const checksum = await md5BlobBase64(file, {
    signal: opts.signal,
    onProgress: (done, total) =>
      onProgress?.({ phase: "hash", fraction: (done / total) * HASH_SHARE })
  });

  const cancelled = () => new UploadError(0, "Upload cancelled.");
  if (opts.signal?.aborted) throw cancelled();

  const created = await v1<DirectUpload>("/uploads", {
    method: "POST",
    token,
    signal: opts.signal,
    body: {
      filename: file.name,
      byte_size: file.size,
      checksum,
      content_type: contentTypeFor(file.name, file.type)
    }
  });
  if (!created?.signed_id || !created.direct_upload?.url) {
    throw new ApiError(500, created, "The upload wasn't accepted.");
  }
  // Removed while the POST was in flight: don't start the PUT.
  if (opts.signal?.aborted) throw cancelled();

  await (opts.put || xhrPut)(
    created.direct_upload.url,
    file,
    created.direct_upload.headers || {},
    (loaded, total) =>
      onProgress?.({
        phase: "upload",
        fraction: HASH_SHARE + (total ? loaded / total : 0) * (1 - HASH_SHARE)
      }),
    opts.signal
  );
  onProgress?.({ phase: "done", fraction: 1 });
  return { signedId: created.signed_id };
}
