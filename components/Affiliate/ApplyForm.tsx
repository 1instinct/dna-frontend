import React, { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { cn } from "@lib/utils";
import { Button } from "@components/ui";
import { apiErrorMessage, apiFieldErrors } from "@lib/api/v1";
import { normalizeRefCode } from "@lib/affiliate/ref";
import { formatBps } from "@lib/affiliate/stats";
import {
  AFFILIATE_CHANNELS,
  DEFAULT_COMMISSION_BPS,
  DEFAULT_COOKIE_DAYS
} from "@lib/affiliate/terms";
import type { Affiliate } from "@lib/affiliate/types";
import {
  useAffiliateCodeAvailable,
  useApplyAffiliate
} from "@hooks/useAffiliate";
import { Panel, fieldClass, ghostBtn, hintClass, labelClass } from "./ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ERROR_ID = "aff-apply-error";

const useDebounced = <T,>(value: T, ms: number) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
};

const CodeStatus: React.FC<{
  raw: string;
  debounced: string;
  ownCode?: string;
}> = ({ raw, debounced, ownCode }) => {
  const valid = normalizeRefCode(raw);
  const { data, isFetching, isError } = useAffiliateCodeAvailable(
    valid && valid === ownCode ? "" : debounced
  );

  if (!raw.trim()) {
    return (
      <p className={hintClass}>
        Leave it blank to use your profile handle. 4–24 letters, numbers or
        dashes.
      </p>
    );
  }
  if (!valid) {
    return (
      <p className={cn(hintClass, "text-amber-700")}>
        Use 4–24 letters, numbers or dashes.
      </p>
    );
  }
  if (valid === ownCode) {
    return <p className={hintClass}>Your current code.</p>;
  }
  if (raw !== debounced || isFetching) {
    return (
      <p className={cn(hintClass, "flex items-center gap-1.5")}>
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        Checking…
      </p>
    );
  }
  if (isError || !data) {
    return (
      <p className={hintClass}>
        Couldn&apos;t check this code. We&apos;ll check it when you apply.
      </p>
    );
  }
  return data.available ? (
    <p className={cn(hintClass, "flex items-center gap-1.5 text-emerald-600")}>
      <Check className="h-3.5 w-3.5" aria-hidden />
      {valid} is available
    </p>
  ) : (
    <p className={cn(hintClass, "flex items-center gap-1.5 text-destructive")}>
      <X className="h-3.5 w-3.5" aria-hidden />
      {valid} is taken. Try another.
    </p>
  );
};

type Field =
  | "code"
  | "website"
  | "audience"
  | "channels"
  | "message"
  | "payout_email";

export const ApplyForm: React.FC<{
  defaultEmail?: string;
  /** A previous (rejected) application to start from. */
  previous?: Affiliate | null;
  onCancel?: () => void;
}> = ({ defaultEmail = "", previous, onCancel }) => {
  const app = previous?.application;
  const [code, setCode] = useState(previous?.code || "");
  const [website, setWebsite] = useState(app?.website || "");
  const [audience, setAudience] = useState(app?.audience || "");
  const [channels, setChannels] = useState<string[]>(
    (app?.channels || []).filter(Boolean) as string[]
  );
  const [message, setMessage] = useState(app?.message || "");
  const [payoutEmail, setPayoutEmail] = useState(
    previous?.payout_email || defaultEmail
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<Field, string>>
  >({});
  const debouncedCode = useDebounced(code, 400);
  const availability = useAffiliateCodeAvailable(debouncedCode);
  const apply = useApplyAffiliate();

  useEffect(() => {
    if (defaultEmail && !payoutEmail) setPayoutEmail(defaultEmail);
    // Only fill the default once the account loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultEmail]);

  const toggleChannel = (c: string) =>
    setChannels((cur) =>
      cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]
    );

  const fail = (field: Field, msg: string) => {
    setFieldErrors({ [field]: msg });
    setFormError(msg);
  };

  /** aria wiring for an input: invalid flag plus the shared error text. */
  const invalid = (field: Field) =>
    fieldErrors[field]
      ? { "aria-invalid": true as const, "aria-errormessage": ERROR_ID }
      : {};

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    const normalized = normalizeRefCode(code);
    if (code.trim() && !normalized) {
      return fail("code", "Your code needs 4–24 letters, numbers or dashes.");
    }
    if (
      normalized &&
      normalized !== previous?.code &&
      availability.data?.available === false
    ) {
      return fail("code", `${normalized} is taken. Pick another code.`);
    }
    if (!audience.trim()) {
      return fail("audience", "Tell us about your audience.");
    }
    if (channels.length === 0) {
      return fail(
        "channels",
        "Pick at least one place you'll share your link."
      );
    }
    if (!EMAIL_RE.test(payoutEmail.trim())) {
      return fail(
        "payout_email",
        "Enter the email address we should pay you at."
      );
    }
    apply.mutate(
      {
        ...(normalized ? { code: normalized } : {}),
        website: website.trim(),
        audience: audience.trim(),
        channels,
        message: message.trim(),
        payout_email: payoutEmail.trim()
      },
      {
        onError: (err) => {
          setFieldErrors(apiFieldErrors(err) as Partial<Record<Field, string>>);
          setFormError(
            apiErrorMessage(err, "Your application didn't go through.")
          );
        }
      }
    );
  };

  return (
    <Panel
      title={previous ? "Apply again" : "Apply to the affiliate program"}
      id="affiliate-apply"
    >
      <p className="mb-6 max-w-prose font-body text-sm leading-6 text-muted-foreground">
        Earn {formatBps(DEFAULT_COMMISSION_BPS)} of every order placed through
        your link within {DEFAULT_COOKIE_DAYS} days of the click. We review
        every application by hand.
      </p>

      <form onSubmit={onSubmit} noValidate className="grid gap-5">
        <div>
          <label htmlFor="aff-code" className={labelClass}>
            Your code
          </label>
          <div
            className={cn(
              "flex items-stretch overflow-hidden rounded-md border bg-muted/50 focus-within:border-brand",
              fieldErrors.code ? "border-destructive" : "border-border/30"
            )}
          >
            <span className="flex select-none items-center whitespace-nowrap border-r border-border/30 px-2.5 font-body text-[13px] text-foreground/55 xs:px-3">
              ?ref=
            </span>
            <input
              id="aff-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toLowerCase())}
              maxLength={24}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="yourname"
              aria-describedby="aff-code-status"
              {...invalid("code")}
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-body text-[16px] leading-5 text-foreground placeholder:text-foreground/45 focus:outline-none"
            />
          </div>
          <div id="aff-code-status" aria-live="polite">
            <CodeStatus
              raw={code}
              debounced={debouncedCode}
              ownCode={previous?.code}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="aff-website" className={labelClass}>
              Website or main profile
            </label>
            <input
              id="aff-website"
              type="url"
              inputMode="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://"
              {...invalid("website")}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="aff-email" className={labelClass}>
              Payout email
            </label>
            <input
              id="aff-email"
              type="email"
              autoComplete="email"
              value={payoutEmail}
              onChange={(e) => setPayoutEmail(e.target.value)}
              required
              {...invalid("payout_email")}
              className={fieldClass}
            />
            <p className={hintClass}>Where we send your commission.</p>
          </div>
        </div>

        <fieldset
          className="m-0 min-w-0 border-0 p-0"
          aria-invalid={fieldErrors.channels ? true : undefined}
          aria-errormessage={fieldErrors.channels ? ERROR_ID : undefined}
        >
          <legend className={labelClass}>Where you&apos;ll share it</legend>
          <div className="flex flex-wrap gap-2">
            {AFFILIATE_CHANNELS.map((c) => {
              const on = channels.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleChannel(c)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 font-body text-[13px] leading-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
                    on
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border/30 bg-transparent text-muted-foreground hover:border-brand/40 hover:text-foreground"
                  )}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor="aff-audience" className={labelClass}>
            Your audience
          </label>
          <textarea
            id="aff-audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder="Who follows you, and roughly how many people."
            {...invalid("audience")}
            className={cn(fieldClass, "resize-y")}
          />
        </div>

        <div>
          <label htmlFor="aff-message" className={labelClass}>
            Anything else <span className="text-foreground/55">(optional)</span>
          </label>
          <textarea
            id="aff-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="How you plan to feature the store."
            {...invalid("message")}
            className={cn(fieldClass, "resize-y")}
          />
        </div>

        {formError && (
          <p
            id={ERROR_ID}
            role="alert"
            className="m-0 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 font-body text-sm text-destructive"
          >
            {formError}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={apply.isLoading}>
            {apply.isLoading ? "Applying…" : "Apply"}
          </Button>
          {onCancel && (
            <button type="button" onClick={onCancel} className={ghostBtn}>
              Cancel
            </button>
          )}
          <p className="m-0 font-body text-xs text-foreground/55">
            By applying you agree to the program terms below.
          </p>
        </div>
      </form>
    </Panel>
  );
};

export default ApplyForm;
