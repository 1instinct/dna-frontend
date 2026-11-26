// Upload queue + drop zone for direct uploads: two files at a time, per-file
// progress (hashing, then the PUT), retry and remove.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { FileUp, RotateCcw, X, Check } from "lucide-react";
import { cn } from "@lib/utils";
import {
  acceptFor,
  checkUpload,
  uploadFile,
  UploadGroup
} from "../../lib/upload/directUpload";
import { apiErrorMessage } from "../../lib/api/v1";
import { formatBytes } from "../../lib/digitalKinds";
import { numCls } from "./kit";

export interface UploadJob {
  key: string;
  name: string;
  size: number;
  file?: File;
  progress: number;
  status: "queued" | "uploading" | "done" | "error";
  signedId?: string;
  error?: string;
  /** Already on the server (an existing asset file); nothing to upload. */
  existingId?: number;
}

let seq = 0;
const nextKey = () => `u${Date.now().toString(36)}${(seq++).toString(36)}`;

export function useUploadQueue({
  allowed,
  max,
  concurrency = 2,
  initial = []
}: {
  allowed: UploadGroup[];
  max?: number;
  concurrency?: number;
  initial?: UploadJob[];
}) {
  const [jobs, setJobsState] = useState<UploadJob[]>(initial);
  const [rejected, setRejected] = useState<string[]>([]);
  // The list as of the last change, so `add` can decide outside an updater
  // (updaters must stay pure: React may run them twice).
  const jobsRef = useRef<UploadJob[]>(initial);
  const setJobs = useCallback(
    (next: UploadJob[] | ((js: UploadJob[]) => UploadJob[])) =>
      setJobsState((js) => {
        const out = typeof next === "function" ? next(js) : next;
        jobsRef.current = out;
        return out;
      }),
    []
  );
  const controllers = useRef(new Map<string, AbortController>());
  const started = useRef(new Set<string>());

  const patch = useCallback(
    (key: string, p: Partial<UploadJob>) =>
      setJobs((js) => js.map((j) => (j.key === key ? { ...j, ...p } : j))),
    [setJobs]
  );

  const add = useCallback(
    (files: FileList | File[]) => {
      const problems: string[] = [];
      const current = jobsRef.current;
      const accepted: UploadJob[] = [];
      for (const f of Array.from(files)) {
        if (max && current.length + accepted.length >= max) {
          problems.push(`Only ${max} file${max === 1 ? "" : "s"} allowed.`);
          break;
        }
        const problem = checkUpload(f, allowed);
        if (problem) {
          problems.push(problem);
          continue;
        }
        if (
          current.some((j) => j.name === f.name) ||
          accepted.some((j) => j.name === f.name)
        ) {
          problems.push(`${f.name} is already in the list.`);
          continue;
        }
        accepted.push({
          key: nextKey(),
          name: f.name,
          size: f.size,
          file: f,
          progress: 0,
          status: "queued"
        });
      }
      if (accepted.length) setJobs((js) => [...js, ...accepted]);
      setRejected(problems);
    },
    [allowed, max, setJobs]
  );

  const remove = useCallback(
    (key: string) => {
      controllers.current.get(key)?.abort();
      controllers.current.delete(key);
      setJobs((js) => js.filter((j) => j.key !== key));
    },
    [setJobs]
  );

  const retry = useCallback(
    (key: string) =>
      patch(key, { status: "queued", progress: 0, error: undefined }),
    [patch]
  );

  // Start queued uploads while fewer than `concurrency` are running.
  useEffect(() => {
    const running = jobs.filter((j) => j.status === "uploading").length;
    const ready = jobs
      .filter(
        (j) => j.status === "queued" && j.file && !started.current.has(j.key)
      )
      .slice(0, Math.max(0, concurrency - running));
    for (const job of ready) {
      started.current.add(job.key);
      const ctrl = new AbortController();
      controllers.current.set(job.key, ctrl);
      patch(job.key, { status: "uploading", progress: 0 });
      uploadFile(
        job.file as File,
        undefined,
        (p) => patch(job.key, { progress: p.fraction }),
        { signal: ctrl.signal, allowed }
      )
        .then(({ signedId }) =>
          patch(job.key, { status: "done", progress: 1, signedId })
        )
        .catch((e) => {
          if (ctrl.signal.aborted) return;
          patch(job.key, {
            status: "error",
            error:
              e instanceof Error && !("body" in e)
                ? e.message
                : apiErrorMessage(e, "Upload failed.")
          });
        })
        .finally(() => {
          controllers.current.delete(job.key);
          started.current.delete(job.key);
        });
    }
  }, [jobs, concurrency, patch, allowed]);

  // Abort anything still running when the form goes away.
  useEffect(() => {
    const map = controllers.current;
    return () => {
      map.forEach((c) => {
        try {
          c.abort();
        } catch {
          // never throw from cleanup
        }
      });
    };
  }, []);

  const busy = jobs.some(
    (j) => j.status === "queued" || j.status === "uploading"
  );
  const failed = jobs.some((j) => j.status === "error");
  return {
    jobs,
    setJobs,
    add,
    remove,
    retry,
    busy,
    failed,
    rejected,
    clearRejected: () => setRejected([])
  };
}

export const FileDrop: React.FC<{
  allowed: UploadGroup[];
  onFiles: (files: FileList) => void;
  multiple?: boolean;
  label: string;
  hint?: string;
  disabled?: boolean;
  id: string;
}> = ({ allowed, onFiles, multiple = true, label, hint, disabled, id }) => {
  const [over, setOver] = useState(false);
  return (
    <label
      htmlFor={id}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!disabled && e.dataTransfer.files?.length)
          onFiles(e.dataTransfer.files);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed px-4 py-5 text-center transition-colors",
        over
          ? "border-brand bg-brand/5"
          : "border-border hover:border-brand/50 hover:bg-muted/50",
        disabled && "pointer-events-none opacity-40"
      )}
    >
      <FileUp className="h-5 w-5 text-brand" aria-hidden />
      <span className="font-body text-sm text-foreground">{label}</span>
      {hint && (
        <span className="font-body text-xs text-muted-foreground">{hint}</span>
      )}
      <input
        id={id}
        type="file"
        className="sr-only"
        multiple={multiple}
        accept={acceptFor(allowed)}
        disabled={disabled}
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </label>
  );
};

export const UploadList: React.FC<{
  jobs: UploadJob[];
  onRemove: (key: string) => void;
  onRetry: (key: string) => void;
  extra?: (job: UploadJob) => React.ReactNode;
}> = ({ jobs, onRemove, onRetry, extra }) =>
  jobs.length ? (
    <ul className="divide-y divide-border/30 rounded-lg border border-border/30">
      {jobs.map((j) => (
        <li key={j.key} className="px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate font-body text-sm text-foreground">
              {j.name}
            </span>
            <span
              className={cn(
                numCls,
                "shrink-0 font-body text-xs text-muted-foreground"
              )}
            >
              {formatBytes(j.size)}
            </span>
            {j.status === "done" && (
              <Check
                className="h-4 w-4 shrink-0 text-emerald-600"
                aria-label="Uploaded"
              />
            )}
            {j.status === "error" && (
              <button
                type="button"
                onClick={() => onRetry(j.key)}
                className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label={`Retry ${j.name}`}
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onRemove(j.key)}
              className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive"
              aria-label={`Remove ${j.name}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {(j.status === "uploading" || j.status === "queued") && (
            <div
              className="mt-1.5 h-1 overflow-hidden rounded bg-muted"
              role="progressbar"
              aria-label={`Uploading ${j.name}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(j.progress * 100)}
            >
              <div
                className="h-full bg-brand transition-[width] duration-200"
                style={{ width: `${Math.round(j.progress * 100)}%` }}
              />
            </div>
          )}
          {j.status === "error" && (
            <p className="mt-1 font-body text-xs text-destructive">{j.error}</p>
          )}
          {extra?.(j)}
        </li>
      ))}
    </ul>
  ) : null;
