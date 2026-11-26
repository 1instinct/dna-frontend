import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";

import { ApiError } from "../api/v1";
import {
  checkUpload,
  contentTypeFor,
  uploadFile,
  UploadProgress
} from "../upload/directUpload";

const g = globalThis as unknown as { fetch: typeof fetch };
const realFetch = g.fetch;
afterEach(() => {
  g.fetch = realFetch;
});

const file = (name: string, size: number, type = "") =>
  ({ name, size, type } as { name: string; size: number; type: string });

describe("contentTypeFor", () => {
  test("trusts a known browser type", () => {
    assert.equal(contentTypeFor("voice.wav", "audio/wav"), "audio/wav");
  });
  test("infers from the extension when the browser gives none", () => {
    assert.equal(contentTypeFor("Voice.AIFF", ""), "audio/aiff");
    assert.equal(contentTypeFor("talk.flac", ""), "audio/flac");
    assert.equal(contentTypeFor("clip.mp3", ""), "audio/mpeg");
    assert.equal(contentTypeFor("manifest.json", ""), "application/json");
    assert.equal(contentTypeFor("cover.jpg", ""), "image/jpeg");
  });
  test("normalizes browser aliases for wav", () => {
    assert.equal(contentTypeFor("a.wav", "audio/x-wav"), "audio/wav");
    assert.equal(contentTypeFor("a.wav", "audio/wave"), "audio/wav");
  });
  test("unknown extension and no type is null", () => {
    assert.equal(contentTypeFor("setup.exe", ""), null);
  });
});

describe("checkUpload", () => {
  test("audio up to 50 MB", () => {
    assert.equal(checkUpload(file("a.wav", 50 * 1024 * 1024)), null);
    assert.match(
      checkUpload(file("a.wav", 50 * 1024 * 1024 + 1)) || "",
      /50 MB/
    );
  });
  test("images up to 10 MB", () => {
    assert.match(checkUpload(file("c.png", 11 * 1024 * 1024)) || "", /10 MB/);
  });
  test("JSON up to 256 KB", () => {
    assert.equal(checkUpload(file("data.json", 1000)), null);
    assert.match(checkUpload(file("data.json", 300 * 1024)) || "", /256 KB/);
  });
  test("rejects unknown types and names the allowed ones", () => {
    assert.match(checkUpload(file("x.exe", 10)) || "", /can't be uploaded/);
    assert.match(checkUpload(file("x.exe", 10)) || "", /WAV, .* or JSON\./);
  });
  test("rejects empty files", () => {
    assert.match(checkUpload(file("a.wav", 0)) || "", /empty/);
  });
  test("an accept list narrows what is allowed", () => {
    assert.match(
      checkUpload(file("c.png", 10), ["audio"]) || "",
      /can't be uploaded here/
    );
  });
});

describe("uploadFile", () => {
  test("hashes, asks for a direct upload, PUTs with its headers, returns the signed id", async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    g.fetch = (async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response(
        JSON.stringify({
          signed_id: "sig-1",
          direct_upload: {
            url: "https://bucket.example/abc",
            headers: { "Content-MD5": "x", "Content-Type": "audio/wav" }
          }
        }),
        { status: 200 }
      );
    }) as unknown as typeof fetch;

    const blob = new Blob([new TextEncoder().encode("hello world")], {
      type: "audio/wav"
    });
    const f = Object.assign(blob, { name: "voice.wav" });
    const puts: { url: string; headers: Record<string, string> }[] = [];
    const progress: UploadProgress[] = [];

    const out = await uploadFile(f, "tok", (p) => progress.push(p), {
      put: async (url, _body, headers, onProgress) => {
        puts.push({ url, headers });
        onProgress(11, 11);
      }
    });

    assert.deepEqual(out, { signedId: "sig-1" });
    assert.equal(calls[0].url, "/api/v1/uploads");
    assert.deepEqual(JSON.parse(String(calls[0].init.body)), {
      filename: "voice.wav",
      byte_size: 11,
      checksum: "XrY7u+Ae7tCTyyK7j1rNww==",
      content_type: "audio/wav"
    });
    assert.equal(
      (calls[0].init.headers as Record<string, string>).Authorization,
      "Bearer tok"
    );
    assert.equal(puts[0].url, "https://bucket.example/abc");
    assert.equal(puts[0].headers["Content-MD5"], "x");
    assert.ok(progress.some((p) => p.phase === "hash"));
    assert.equal(progress[progress.length - 1].phase, "done");
    assert.equal(progress[progress.length - 1].fraction, 1);
  });

  test("a rejected file never reaches the API", async () => {
    let called = false;
    g.fetch = (async () => {
      called = true;
      return new Response("{}");
    }) as unknown as typeof fetch;
    const f = Object.assign(new Blob([]), { name: "empty.wav" });
    await assert.rejects(uploadFile(f, "tok"), /empty/);
    assert.equal(called, false);
  });

  test("a 422 from the uploads endpoint surfaces as ApiError", async () => {
    g.fetch = (async () =>
      new Response(JSON.stringify({ error: "Unsupported type" }), {
        status: 422
      })) as unknown as typeof fetch;
    const f = Object.assign(new Blob(["x"], { type: "audio/wav" }), {
      name: "a.wav"
    });
    await assert.rejects(
      uploadFile(f, "tok", undefined, { put: async () => undefined }),
      (e: unknown) => e instanceof ApiError && e.status === 422
    );
  });

  test("a cancel during the POST stops before the PUT", async () => {
    const ctrl = new AbortController();
    let seenSignal: AbortSignal | null | undefined;
    g.fetch = (async (_url: string, init: RequestInit) => {
      seenSignal = init.signal;
      ctrl.abort();
      return new Response(
        JSON.stringify({
          signed_id: "sig-1",
          direct_upload: { url: "https://bucket.example/abc", headers: {} }
        }),
        { status: 200 }
      );
    }) as unknown as typeof fetch;
    const f = Object.assign(new Blob(["x"], { type: "audio/wav" }), {
      name: "a.wav"
    });
    let put = false;
    await assert.rejects(
      uploadFile(f, "tok", undefined, {
        signal: ctrl.signal,
        put: async () => {
          put = true;
        }
      }),
      /cancelled/i
    );
    assert.equal(put, false);
    assert.ok(seenSignal, "the POST got an abort signal");
  });
});
