import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { cn } from "@lib/utils";
import { Button, Skeleton } from "@components/ui";
import {
  useCreatorProduct,
  useDeleteCreatorProduct,
  useSaveCreatorProduct,
  useSubmitCreatorProduct
} from "@hooks/useCreator";
import { useMarketplaceTaxons } from "@hooks/useMarketplace";
import type { CreatorProduct } from "../../lib/creator/types";
import {
  DraftFile,
  draftFromProduct,
  draftToInput,
  emptyDraft,
  filesChanged,
  MIN_PRICE,
  ProductDraft,
  stepErrors
} from "../../lib/creator/productDraft";
import {
  canDelete,
  canEdit,
  canSubmitNow,
  willSubmit
} from "../../lib/creator/reviewRules";
import { UploadGroup, UPLOAD_RULES } from "../../lib/upload/directUpload";
import { formatBytes, kindLabel } from "../../lib/digitalKinds";
import { sellableKinds } from "../../lib/marketplace";
import {
  Chip,
  ErrorNote,
  Field,
  formatMoney,
  inputCls,
  numCls,
  PageTitle,
  REVIEW,
  ReviewChip,
  Section
} from "./kit";
import { FileDrop, UploadJob, UploadList, useUploadQueue } from "./uploads";

const STEPS = [
  { id: "kind", label: "Kind" },
  { id: "details", label: "Details" },
  { id: "files", label: "Files" },
  { id: "preview", label: "Preview media" },
  { id: "review", label: "Review" }
] as const;
type StepId = (typeof STEPS)[number]["id"];

/** Every upload group the backend accepts for product files. */
const FILE_GROUPS = Object.keys(UPLOAD_RULES) as UploadGroup[];

const fileHint = FILE_GROUPS.map(
  (g) =>
    `${Object.keys(UPLOAD_RULES[g].types)
      .map((e) => e.toUpperCase())
      .join(", ")} up to ${UPLOAD_RULES[g].maxLabel}`
).join(" · ");

/** Loads the product (when editing) and mounts the editor on it. */
export const ProductWizard: React.FC<{ productId: number | null }> = ({
  productId
}) => {
  const q = useCreatorProduct(productId);
  if (productId && q.isLoading) return <Skeleton className="h-96" />;
  if (productId && q.isError)
    return (
      <ErrorNote
        error={q.error}
        fallback="That product didn't load. It may have been deleted."
      />
    );
  const product = q.data || null;
  // Remount from the server's copy after every save.
  return (
    <WizardBody
      key={product ? `${product.id}:${product.updated_at}` : "new"}
      product={product}
    />
  );
};

const existingJobs = (p: CreatorProduct | null): UploadJob[] =>
  (p?.asset?.files || []).map((f) => ({
    key: `existing-${f.id}`,
    name: f.filename,
    size: f.byte_size,
    progress: 1,
    status: "done",
    existingId: f.id
  }));

const WizardBody: React.FC<{ product: CreatorProduct | null }> = ({
  product
}) => {
  const router = useRouter();
  const save = useSaveCreatorProduct();
  const submit = useSubmitCreatorProduct();
  const del = useDeleteCreatorProduct();
  const taxons = useMarketplaceTaxons();
  const kinds = sellableKinds();
  // With one kind there is nothing to choose, so the Kind step is skipped.
  const singleKind = kinds.length === 1 ? kinds[0].kind : null;
  const steps = STEPS.filter((s) => !(s.id === "kind" && singleKind));

  const [draft, setDraft] = useState<ProductDraft>(() =>
    product ? draftFromProduct(product) : emptyDraft(singleKind)
  );

  const files = useUploadQueue({
    allowed: FILE_GROUPS,
    initial: existingJobs(product)
  });
  const image = useUploadQueue({ allowed: ["image"], max: 1 });
  const audio = useUploadQueue({ allowed: ["audio"], max: 1 });
  const [submitNote, setSubmitNote] = useState<string | null>(null);

  const stepParam = String(router.query.step || "");
  const step: StepId = (steps.find((s) => s.id === stepParam)?.id ||
    (product || singleKind ? "details" : "kind")) as StepId;
  const goTo = (id: StepId) =>
    router.replace(
      { pathname: router.pathname, query: { ...router.query, step: id } },
      undefined,
      { shallow: true, scroll: false }
    );
  const stepIndex = steps.findIndex((s) => s.id === step);

  const jobs = files.jobs as DraftFile[];
  const errors = stepErrors(draft, jobs);
  const previewBusy = image.busy || audio.busy;
  const errorCount =
    errors.kind.length + errors.details.length + errors.files.length;

  const originalFileIds = product
    ? (product.asset?.files || []).map((f) => f.id)
    : null;
  // Files differ from the server's: saving starts a new version.
  const assetDirty = filesChanged(jobs, originalFileIds);
  const previewDirty = !!(image.jobs.length || audio.jobs.length);

  // Unsaved changes guard.
  const baseline = useRef<string | null>(null);
  const snapshot = JSON.stringify([
    draft,
    files.jobs.map((j) => [j.name, j.signedId, j.existingId]),
    image.jobs.map((j) => j.signedId),
    audio.jobs.map((j) => j.signedId)
  ]);
  if (baseline.current === null) baseline.current = snapshot;
  const dirty = snapshot !== baseline.current;
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // In-app navigation away with unsaved changes asks first. Step changes
  // (same page, new ?step=) and our own post-save moves pass through.
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const leaving = useRef(false);
  useEffect(() => {
    const onRoute = (url: string) => {
      if (leaving.current || !dirtyRef.current) return;
      const path = (u: string) => u.split(/[?#]/)[0];
      if (path(url) === path(router.asPath)) return;
      if (window.confirm("Leave without saving? Your changes will be lost."))
        return;
      router.events.emit("routeChangeError");
      // Next has no cancel API: throwing aborts the route change.
      throw new Error("Navigation cancelled: unsaved changes");
    };
    router.events.on("routeChangeStart", onRoute);
    return () => {
      try {
        router.events.off("routeChangeStart", onRoute);
      } catch {
        // never throw from cleanup
      }
    };
  }, [router]);

  const state = product?.review_state;
  const editable = !product || canEdit(product);
  const locked = !editable;
  const live = !!product?.live_asset_version;
  const canSubmit = willSubmit(product, {
    asset: assetDirty,
    preview: previewDirty
  });

  const doSave = async (): Promise<CreatorProduct | null> => {
    if (!draft.kind) return null;
    const saved = await save.mutateAsync({
      id: product?.id,
      input: draftToInput(draft, jobs, {
        originalFileIds,
        previewImageSignedId: image.jobs[0]?.signedId,
        previewAudioSignedId: audio.jobs[0]?.signedId
      })
    });
    baseline.current = null;
    if (!product) {
      leaving.current = true;
      await router.replace(
        { pathname: `/creator/products/${saved.id}`, query: { step } },
        undefined,
        { shallow: false }
      );
    }
    return saved;
  };

  const onSave = () => {
    save.reset();
    setSubmitNote(null);
    doSave().catch(() => undefined);
  };

  const onSubmit = async () => {
    setSubmitNote(null);
    try {
      const saved = dirty || !product ? await doSave() : product;
      if (!saved) return;
      if (!canSubmitNow(saved)) {
        setSubmitNote(
          "Saved. There's nothing new to review: details on a live product change right away."
        );
        return;
      }
      await submit.mutateAsync(saved.id);
      leaving.current = true;
      router.push("/creator/products");
    } catch {
      // shown through save.error / submit.error
    }
  };

  const stepHasError = (id: StepId) =>
    id === "kind"
      ? errors.kind.length > 0
      : id === "details"
      ? errors.details.length > 0
      : id === "files"
      ? errors.files.length > 0
      : false;

  const totalBytes = files.jobs.reduce((n, j) => n + j.size, 0);

  return (
    <>
      <PageTitle
        sub={
          product ? (
            <span className="inline-flex flex-wrap items-center gap-2">
              <ReviewChip state={product.review_state} />
              {product.live_asset_version && (
                <span className={numCls}>
                  live v{product.live_asset_version}
                </span>
              )}
              {product.slug && product.review_state === "approved" && (
                <Link
                  href={`/${product.slug}`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  View in shop
                </Link>
              )}
            </span>
          ) : (
            "Build it step by step. Save a draft any time."
          )
        }
        actions={
          product && canDelete(product) ? (
            <Button
              type="button"
              variant="outline"
              className="text-destructive"
              disabled={del.isLoading}
              onClick={() => {
                if (
                  window.confirm(
                    `Delete “${product.name}”? This can't be undone.`
                  )
                )
                  del
                    .mutateAsync(product.id)
                    .then(() => {
                      leaving.current = true;
                      return router.push("/creator/products");
                    })
                    .catch(() => undefined);
              }}
            >
              <Trash2 aria-hidden /> Delete draft
            </Button>
          ) : undefined
        }
      >
        {product ? product.name || "Untitled" : "New product"}
      </PageTitle>

      {product?.review_note &&
        (state === "changes_requested" || state === "rejected") && (
          <div className="mb-4 rounded-lg border border-brand/40 bg-brand/5 px-3 py-2">
            <div className="font-title text-xs font-semibold text-brand">
              {REVIEW[state].label}
            </div>
            <p className="font-body text-sm text-foreground">
              {product.review_note}
            </p>
          </div>
        )}
      {locked && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/5 px-3 py-2 font-body text-sm text-foreground">
          {state === "submitted"
            ? "This product is in review, so it can't be edited until the review is done."
            : "This product was rejected before it went live, so it can't be edited. Start a new product instead."}
        </div>
      )}
      {live && editable && (
        <div className="mb-4 rounded-lg border border-border/30 px-3 py-2 font-body text-sm text-muted-foreground">
          This product is live. Name, description, price and category change as
          soon as you save. New files or new preview media become a new version
          for review; buyers keep the live version until it&apos;s approved.
        </div>
      )}
      <ErrorNote error={del.error} />

      {/* Stepper */}
      <ol className="mb-4 flex gap-1 overflow-x-auto" aria-label="Steps">
        {steps.map((s, i) => {
          const current = s.id === step;
          const bad = stepHasError(s.id) && i < stepIndex;
          return (
            <li key={s.id} className="flex shrink-0 items-center gap-1">
              {i > 0 && (
                <span
                  aria-hidden
                  className={cn(
                    "h-px w-3 sm:w-6",
                    i <= stepIndex ? "bg-brand/60" : "bg-border"
                  )}
                />
              )}
              <button
                type="button"
                onClick={() => goTo(s.id)}
                disabled={!draft.kind && s.id !== "kind"}
                aria-current={current ? "step" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-md border px-2 py-1 font-body text-xs transition-colors disabled:opacity-30",
                  current
                    ? "border-brand/70 bg-brand/10 text-brand"
                    : "border-border/30 text-muted-foreground hover:text-foreground"
                )}
              >
                <span className={cn(numCls, "text-[11px]")}>{i + 1}</span>
                <span className={cn(!current && "hidden sm:inline")}>
                  {s.label}
                </span>
                {bad && (
                  <>
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-destructive"
                      aria-hidden
                    />
                    <span className="sr-only">, has problems</span>
                  </>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      <fieldset disabled={locked} className="min-w-0 space-y-4">
        {step === "kind" && (
          <Section title="What are you making?">
            <div className="grid gap-2 md:grid-cols-3">
              {kinds.map(({ kind: k, label }) => {
                const on = draft.kind === k;
                const lockedKind = !!product && product.kind !== k;
                return (
                  <button
                    key={k}
                    type="button"
                    disabled={lockedKind}
                    onClick={() => {
                      setDraft((d) => ({ ...d, kind: k }));
                      goTo("details");
                    }}
                    aria-pressed={on}
                    className={cn(
                      "rounded-lg border p-3 text-left font-title text-sm transition-colors disabled:opacity-30",
                      on
                        ? "border-brand/70 bg-brand/5 text-brand"
                        : "border-border/30 text-foreground hover:border-brand/40"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {product && (
              <p className="mt-2 font-body text-xs text-muted-foreground">
                The kind can&apos;t change after a product is created.
              </p>
            )}
          </Section>
        )}

        {step === "details" && (
          <Section title="Details">
            <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
              <Field label="Name" htmlFor="pd-name">
                <input
                  id="pd-name"
                  className={inputCls}
                  maxLength={80}
                  value={draft.name}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, name: e.target.value }))
                  }
                />
              </Field>
              <Field
                label="Price"
                htmlFor="pd-price"
                hint={`At least ${MIN_PRICE.toFixed(2)}`}
              >
                <input
                  id="pd-price"
                  className={cn(inputCls, numCls)}
                  inputMode="decimal"
                  placeholder="4.99"
                  value={draft.price}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      price: e.target.value.replace(/[^0-9.]/g, "")
                    }))
                  }
                />
              </Field>
              <Field
                label="Description"
                htmlFor="pd-desc"
                className="sm:col-span-2"
              >
                <textarea
                  id="pd-desc"
                  className={cn(inputCls, "min-h-[120px] resize-y")}
                  maxLength={4000}
                  value={draft.description}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, description: e.target.value }))
                  }
                />
              </Field>
              {(taxons.data?.length || 0) > 0 && (
                <fieldset className="sm:col-span-2">
                  <legend className="mb-1 font-title text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Category
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {taxons.data?.map((t) => {
                      const on = draft.taxonIds.includes(t.id);
                      return (
                        <label
                          key={t.id}
                          className={cn(
                            "flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 font-body text-sm",
                            on
                              ? "border-brand/60 bg-brand/10 text-brand"
                              : "border-border/30 text-muted-foreground"
                          )}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={on}
                            onChange={() =>
                              setDraft((d) => ({
                                ...d,
                                taxonIds: on
                                  ? d.taxonIds.filter((x) => x !== t.id)
                                  : [...d.taxonIds, t.id]
                              }))
                            }
                          />
                          {t.name}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              )}
            </div>
            <StepProblems list={errors.details} />
          </Section>
        )}

        {step === "files" && draft.kind && (
          <Section
            title="Files"
            aside={
              <span className={`${numCls} text-xs text-muted-foreground`}>
                {files.jobs.length} files · {formatBytes(totalBytes)}
              </span>
            }
          >
            <div className="space-y-2">
              <FileDrop
                id="pd-files"
                allowed={FILE_GROUPS}
                onFiles={files.add}
                label="Drop files or choose"
                hint={fileHint}
              />
              {files.rejected.map((r) => (
                <p key={r} className="font-body text-xs text-destructive">
                  {r}
                </p>
              ))}
              <UploadList
                jobs={files.jobs}
                onRemove={files.remove}
                onRetry={files.retry}
              />
              <StepProblems list={errors.files} />
            </div>
          </Section>
        )}

        {step === "preview" && (
          <Section title="Preview media">
            {live && (
              <p className="mb-3 font-body text-xs text-muted-foreground">
                New preview media on a live product go through review too. The
                shop keeps the current ones until then.
              </p>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="font-title text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Cover image
                </div>
                {product?.preview?.image_url && !image.jobs.length && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.preview.image_url}
                    alt="Current cover"
                    className="aspect-video w-full rounded-lg object-cover"
                  />
                )}
                <FileDrop
                  id="pd-image"
                  allowed={["image"]}
                  multiple={false}
                  onFiles={(fl) => image.add(fl)}
                  disabled={image.jobs.length >= 1}
                  label={
                    product?.preview?.image_url
                      ? "Replace the cover"
                      : "Add a cover"
                  }
                  hint={`PNG, JPG or WebP up to ${UPLOAD_RULES.image.maxLabel}. 16:9 works best.`}
                />
                <UploadList
                  jobs={image.jobs}
                  onRemove={image.remove}
                  onRetry={image.retry}
                />
              </div>
              <div className="space-y-2">
                <div className="font-title text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Audio preview (optional)
                </div>
                {product?.preview?.audio_url && !audio.jobs.length && (
                  <audio
                    controls
                    src={product.preview.audio_url}
                    className="w-full"
                  >
                    <track kind="captions" />
                  </audio>
                )}
                <FileDrop
                  id="pd-audio"
                  allowed={["audio"]}
                  multiple={false}
                  onFiles={(fl) => audio.add(fl)}
                  disabled={audio.jobs.length >= 1}
                  label={
                    product?.preview?.audio_url
                      ? "Replace the audio preview"
                      : "Add an audio preview"
                  }
                  hint={`Up to ${UPLOAD_RULES.audio.maxLabel}.`}
                />
                <UploadList
                  jobs={audio.jobs}
                  onRemove={audio.remove}
                  onRetry={audio.retry}
                />
              </div>
            </div>
          </Section>
        )}

        {step === "review" && draft.kind && (
          <Section title="Review and submit">
            <dl className="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-1.5 font-body text-sm">
              <dt className="text-muted-foreground">Kind</dt>
              <dd className="text-foreground">{kindLabel(draft.kind)}</dd>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="text-foreground">{draft.name || "—"}</dd>
              <dt className="text-muted-foreground">Price</dt>
              <dd className={`${numCls} text-foreground`}>
                {formatMoney(draft.price || 0, product?.currency)}
              </dd>
              <dt className="text-muted-foreground">Files</dt>
              <dd className="text-foreground">
                {files.jobs.length}, {formatBytes(totalBytes)}
              </dd>
              <dt className="text-muted-foreground">Cover</dt>
              <dd className="text-foreground">
                {image.jobs[0]?.name ||
                  (product?.preview?.image_url ? "Saved" : "None")}
              </dd>
            </dl>

            {errorCount > 0 ? (
              <div className="mt-4 space-y-2">
                {(["kind", "details", "files"] as StepId[]).map((id) => {
                  const list = errors[id as keyof typeof errors];
                  if (!list.length) return null;
                  return (
                    <div
                      key={id}
                      className="rounded-lg border border-destructive/30 px-3 py-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-title text-xs font-semibold text-destructive">
                          {STEPS.find((s) => s.id === id)?.label}
                        </span>
                        <button
                          type="button"
                          className="font-body text-xs text-muted-foreground underline"
                          onClick={() => goTo(id)}
                        >
                          Fix
                        </button>
                      </div>
                      <ul className="mt-1 list-disc pl-4">
                        {list.map((e) => (
                          <li
                            key={e}
                            className="font-body text-xs text-foreground"
                          >
                            {e}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : canSubmit ? (
              <p className="mt-4 font-body text-sm text-muted-foreground">
                Ready. After you submit, an admin reviews it and puts it live,
                or sends it back with a note.
              </p>
            ) : null}
          </Section>
        )}
      </fieldset>

      <ErrorNote error={save.error} fallback="Saving failed. Try again." />
      <ErrorNote
        error={submit.error}
        fallback="Submitting failed. Try again."
      />

      {/* Footer actions */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-4 flex flex-wrap items-center gap-2 border-t border-border/30 bg-background/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
        <Button
          type="button"
          variant="ghost"
          disabled={stepIndex <= 0}
          onClick={() => goTo(steps[stepIndex - 1].id)}
        >
          <ChevronLeft aria-hidden /> Back
        </Button>
        {step !== "review" && (
          <Button
            type="button"
            variant="ghost"
            disabled={!draft.kind}
            onClick={() => goTo(steps[stepIndex + 1].id)}
          >
            Next <ChevronRight aria-hidden />
          </Button>
        )}
        <span className="ml-auto font-body text-xs text-muted-foreground">
          {dirty ? "Unsaved changes" : product ? "Saved" : ""}
        </span>
        <Button
          type="button"
          variant="outline"
          disabled={
            locked || !draft.kind || save.isLoading || files.busy || previewBusy
          }
          onClick={onSave}
        >
          {save.isLoading ? "Saving…" : live ? "Save" : "Save draft"}
        </Button>
        {step === "review" && (
          <Button
            type="button"
            disabled={
              !canSubmit ||
              errorCount > 0 ||
              save.isLoading ||
              submit.isLoading ||
              files.busy ||
              previewBusy
            }
            onClick={onSubmit}
          >
            {submit.isLoading
              ? "Submitting…"
              : live
              ? "Submit new version"
              : "Submit for review"}
          </Button>
        )}
      </div>
      {submitNote && (
        <p
          role="status"
          className="mt-2 font-body text-xs text-muted-foreground"
        >
          {submitNote}
        </p>
      )}
      {product && !canSubmit && step === "review" && !locked && (
        <p className="mt-2 font-body text-xs text-muted-foreground">
          {live
            ? "Nothing to review: change the files or the preview media to submit a new version. Details save straight to the shop."
            : "Add files before submitting."}
        </p>
      )}
      {locked && <Chip className="mt-2">Locked while in review</Chip>}
    </>
  );
};

const StepProblems: React.FC<{ list: string[] }> = ({ list }) =>
  list.length ? (
    <ul className="mt-3 space-y-0.5">
      {list.map((e) => (
        <li key={e} className="font-body text-xs text-amber-700">
          {e}
        </li>
      ))}
    </ul>
  ) : null;
