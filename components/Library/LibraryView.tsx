import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, Download, ExternalLink } from "lucide-react";
import { cn } from "@lib/utils";
import { Badge, Button, EmptyState, Skeleton } from "@components/ui";
import { getLibraryLinks, useLibrary } from "@hooks/useLibrary";
import { apiErrorMessage } from "../../lib/api/v1";
import {
  groupLibrary,
  libraryAppLink,
  LIBRARY_SOURCE_LABELS,
  LibraryItem
} from "../../lib/library";
import { formatBytes, kindLabel } from "../../lib/digitalKinds";

const formatDate = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
};

/** Start a browser download of a signed URL without leaving the page. */
const startDownload = (url: string, filename: string) => {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
};

const ItemRow: React.FC<{ item: LibraryItem }> = ({ item }) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const revoked = !!item.revoked_at;
  const files = item.asset?.files || [];
  const appLink = revoked ? null : libraryAppLink(item.variant_id);

  const download = async (fileId: number, filename: string) => {
    setBusy(fileId);
    setError(null);
    try {
      // Links are short-lived, so ask for one right before each download.
      const [link] = await getLibraryLinks(item.ownership_id, [fileId]);
      if (!link?.url) throw new Error("No download link came back.");
      startDownload(link.url, filename);
    } catch (e) {
      setError(apiErrorMessage(e, "Couldn't start the download. Try again."));
    } finally {
      setBusy(null);
    }
  };

  return (
    <li
      className={cn(
        "rounded-xl border border-border/30 bg-card",
        revoked && "opacity-60"
      )}
    >
      <div className="flex items-center gap-3 p-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
          {item.product.image_url ? (
            <img
              src={item.product.image_url}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              href={`/${item.product.slug}`}
              className="truncate font-title text-sm font-semibold text-foreground no-underline hover:text-brand"
            >
              {item.product.name}
            </Link>
            {revoked ? (
              <Badge variant="destructive">
                Removed {formatDate(item.revoked_at)}
              </Badge>
            ) : (
              <Badge variant="secondary">
                {LIBRARY_SOURCE_LABELS[item.source] || item.source}
              </Badge>
            )}
          </div>
          <div className="mt-0.5 truncate font-body text-xs text-muted-foreground">
            {item.product.creator?.name
              ? `by ${item.product.creator.name} · `
              : ""}
            <span className="tabular-nums">
              v{item.asset?.version ?? 1} ·{" "}
              {formatBytes(item.asset?.byte_size || 0)}
            </span>
          </div>
        </div>
        {appLink && (
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <a href={appLink}>
              <ExternalLink aria-hidden />
              Open in app
            </a>
          </Button>
        )}
      </div>

      {revoked ? (
        <p className="border-t border-border/30 px-3 py-2 font-body text-xs text-muted-foreground">
          This order was refunded or cancelled, so the files are no longer
          available.
        </p>
      ) : (
        files.length > 0 && (
          <div className="flex items-center border-t border-border/30 px-3 py-2">
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              className="inline-flex items-center gap-1 rounded px-2 py-1 font-body text-xs text-muted-foreground hover:text-foreground"
            >
              {files.length} {files.length === 1 ? "file" : "files"}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  open && "rotate-180"
                )}
                aria-hidden
              />
            </button>
          </div>
        )
      )}

      {!revoked && open && (
        <ul className="divide-y divide-border/30 border-t border-border/30">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-2 px-3 py-1.5">
              <span className="min-w-0 flex-1 truncate font-body text-xs text-foreground">
                {f.filename}
              </span>
              <span className="shrink-0 font-body text-[11px] tabular-nums text-muted-foreground">
                {formatBytes(f.byte_size)}
              </span>
              <button
                type="button"
                onClick={() => download(f.id, f.filename)}
                disabled={busy !== null}
                aria-label={`Download ${f.filename}`}
                className="shrink-0 rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-brand disabled:opacity-40"
              >
                <Download
                  className={cn("h-4 w-4", busy === f.id && "animate-pulse")}
                  aria-hidden
                />
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p
          role="alert"
          className="px-3 pb-2 font-body text-xs text-destructive"
        >
          {error}
        </p>
      )}
    </li>
  );
};

export const LibraryView: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const library = useLibrary(enabled);

  if (!enabled || library.isLoading)
    return (
      <div className="space-y-2">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    );
  if (library.isError)
    return (
      <p
        role="alert"
        className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 font-body text-sm text-destructive"
      >
        {apiErrorMessage(
          library.error,
          "Couldn't load your library. Try again."
        )}
      </p>
    );

  const groups = groupLibrary(library.data || []);
  if (groups.length === 0)
    return (
      <EmptyState
        className="rounded-xl bg-card"
        title="Your library is empty"
        description="Digital products you buy or claim land here, ready to download."
        ctaLabel="Browse products"
        ctaHref="/browse"
      />
    );

  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <section key={g.kind} aria-labelledby={`lib-${g.kind}`}>
          <h3
            id={`lib-${g.kind}`}
            className="mb-2 flex items-baseline gap-2 font-title text-sm font-semibold text-foreground"
          >
            {kindLabel(g.kind, true)}
            <span className="font-body text-xs tabular-nums text-muted-foreground">
              {g.items.length}
            </span>
          </h3>
          <ul className="space-y-2">
            {g.items.map((item) => (
              <ItemRow key={item.ownership_id} item={item} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};
