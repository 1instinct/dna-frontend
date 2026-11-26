import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@lib/utils";
import { useApplyCreator } from "@hooks/useCreator";
import { Button } from "@components/ui";
import type { DigitalKind } from "../../lib/digitalKinds";
import { sellableKinds } from "../../lib/marketplace";
import type { PortfolioLink } from "../../lib/creator/types";
import { ErrorNote, Field, inputCls, Section } from "../CreatorPortal/kit";
import { FileDrop, UploadList, useUploadQueue } from "../CreatorPortal/uploads";

const MAX_LINKS = 5;
/** Example files an application may carry (backend Creators.config). */
const MAX_EXAMPLES = 3;

const isUrl = (v: string) => {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
};

export const ApplyForm: React.FC<{ defaultName?: string }> = ({
  defaultName = ""
}) => {
  const apply = useApplyCreator();
  const [displayName, setDisplayName] = useState(defaultName);
  const options = sellableKinds();
  // With one kind there is nothing to choose: it is preselected and hidden.
  const [kinds, setKinds] = useState<DigitalKind[]>(
    options.length === 1 ? [options[0].kind] : []
  );
  const [links, setLinks] = useState<PortfolioLink[]>([{ label: "", url: "" }]);
  const [about, setAbout] = useState("");
  const [tried, setTried] = useState(false);
  const examples = useUploadQueue({
    allowed: ["audio", "image", "json"],
    max: MAX_EXAMPLES
  });

  const cleanLinks = links.filter((l) => l.url.trim());
  const errors = {
    displayName:
      displayName.trim().length < 2 ? "Enter the name buyers will see." : null,
    kinds: kinds.length ? null : "Pick at least one.",
    links: cleanLinks.every((l) => isUrl(l.url.trim()))
      ? null
      : "Links must start with https://",
    about:
      about.trim().length < 40
        ? "Tell us a little more (at least 40 characters)."
        : null
  };
  const valid = !Object.values(errors).some(Boolean);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!valid || examples.busy || examples.failed) return;
    apply.mutate({
      display_name: displayName.trim(),
      kinds,
      portfolio_links: cleanLinks.map((l) => ({
        label: l.label.trim() || new URL(l.url.trim()).hostname,
        url: l.url.trim()
      })),
      about: about.trim(),
      // The backend's name for the example files.
      sample_upload_signed_ids: examples.jobs
        .map((j) => j.signedId)
        .filter((s): s is string => !!s)
    });
  };

  const toggleKind = (k: DigitalKind) =>
    setKinds((ks) => (ks.includes(k) ? ks.filter((x) => x !== k) : [...ks, k]));

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Section title="About you">
        <div className="space-y-4">
          <Field
            label="Creator name"
            htmlFor="cr-name"
            hint="Shown on your products as the byline."
            error={tried ? errors.displayName : null}
          >
            <input
              id="cr-name"
              className={inputCls}
              value={displayName}
              maxLength={60}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="nickname"
            />
          </Field>

          <fieldset className={cn(options.length === 1 && "hidden")}>
            <legend className="mb-1 font-body text-xs text-muted-foreground">
              What you want to sell
            </legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {options.map(({ kind: k, plural }) => {
                const on = kinds.includes(k);
                return (
                  <label
                    key={k}
                    className={cn(
                      "flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 transition-colors",
                      on
                        ? "border-brand/60 bg-brand/5"
                        : "border-border/30 hover:border-white/25"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggleKind(k)}
                      className="mt-0.5 h-4 w-4 accent-brand"
                    />
                    <span className="font-body text-sm text-foreground">
                      {plural}
                    </span>
                  </label>
                );
              })}
            </div>
            {tried && errors.kinds && (
              <p className="mt-1 font-body text-xs text-destructive">
                {errors.kinds}
              </p>
            )}
          </fieldset>

          <Field
            label="Your work so far"
            htmlFor="cr-about"
            hint="What you've made before and what you'd like to sell here."
            error={tried ? errors.about : null}
          >
            <textarea
              id="cr-about"
              className={cn(inputCls, "min-h-[120px] resize-y")}
              value={about}
              maxLength={2000}
              onChange={(e) => setAbout(e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section title="Links">
        <div className="space-y-2">
          {links.map((l, i) => (
            <div key={i} className="flex gap-2">
              <input
                aria-label={`Link ${i + 1} label`}
                placeholder="Label (Portfolio)"
                className={cn(inputCls, "w-1/3 min-w-0")}
                value={l.label}
                onChange={(e) =>
                  setLinks((ls) =>
                    ls.map((x, j) =>
                      j === i ? { ...x, label: e.target.value } : x
                    )
                  )
                }
              />
              <input
                aria-label={`Link ${i + 1} URL`}
                placeholder="https://"
                inputMode="url"
                className={cn(inputCls, "min-w-0 flex-1")}
                value={l.url}
                onChange={(e) =>
                  setLinks((ls) =>
                    ls.map((x, j) =>
                      j === i ? { ...x, url: e.target.value } : x
                    )
                  )
                }
              />
              <button
                type="button"
                className="shrink-0 rounded p-2 text-muted-foreground hover:text-destructive"
                aria-label={`Remove link ${i + 1}`}
                onClick={() =>
                  setLinks((ls) =>
                    ls.length > 1
                      ? ls.filter((_, j) => j !== i)
                      : [{ label: "", url: "" }]
                  )
                }
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {tried && errors.links && (
            <p className="font-body text-xs text-destructive">{errors.links}</p>
          )}
          {links.length < MAX_LINKS && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setLinks((ls) => [...ls, { label: "", url: "" }])}
            >
              <Plus aria-hidden /> Add a link
            </Button>
          )}
        </div>
      </Section>

      <Section
        title="Examples of your work"
        aside={
          <span className="font-body text-xs tabular-nums text-muted-foreground">
            {examples.jobs.length}/{MAX_EXAMPLES}
          </span>
        }
      >
        <div className="space-y-2">
          <p className="font-body text-sm text-muted-foreground">
            Optional: up to {MAX_EXAMPLES} files that show what you&apos;d sell.
          </p>
          <FileDrop
            id="cr-examples"
            allowed={["audio", "image", "json"]}
            onFiles={examples.add}
            disabled={examples.jobs.length >= MAX_EXAMPLES}
            label="Drop files or choose"
            hint="Audio up to 50 MB · images up to 10 MB · JSON"
          />
          {examples.rejected.map((r) => (
            <p key={r} className="font-body text-xs text-destructive">
              {r}
            </p>
          ))}
          <UploadList
            jobs={examples.jobs}
            onRemove={examples.remove}
            onRetry={examples.retry}
          />
        </div>
      </Section>

      <ErrorNote
        error={apply.error}
        fallback="Your application wasn't sent. Try again."
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={apply.isLoading || examples.busy}>
          {apply.isLoading
            ? "Sending…"
            : examples.busy
            ? "Uploading…"
            : "Send application"}
        </Button>
        {examples.failed && (
          <span className="font-body text-xs text-destructive">
            Retry or remove the files that failed.
          </span>
        )}
      </div>
    </form>
  );
};
