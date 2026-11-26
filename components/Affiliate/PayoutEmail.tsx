import React, { useEffect, useRef, useState } from "react";
import { cn } from "@lib/utils";
import { apiErrorMessage, apiFieldErrors } from "@lib/api/v1";
import { useUpdateAffiliate } from "@hooks/useAffiliate";
import { fieldClass, ghostBtn } from "./ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** "Paid to x@y" with an inline Change form (PATCH /affiliate payout_email). */
export const PayoutEmail: React.FC<{
  email?: string | null;
  className?: string;
}> = ({ email, className }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(email || "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const changeRef = useRef<HTMLButtonElement>(null);
  const update = useUpdateAffiliate();

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2500);
    return () => clearTimeout(t);
  }, [saved]);

  const close = () => {
    setEditing(false);
    setError(null);
    setTimeout(() => changeRef.current?.focus(), 0);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = value.trim();
    if (!EMAIL_RE.test(next)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    update.mutate(
      { payout_email: next },
      {
        onSuccess: () => {
          setSaved(true);
          close();
        },
        onError: (err) =>
          setError(
            apiFieldErrors(err).payout_email
              ? `Payout email ${apiFieldErrors(err).payout_email}`
              : apiErrorMessage(err, "Your payout email didn't save.")
          )
      }
    );
  };

  if (!editing) {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-sm",
          className
        )}
      >
        <span className="min-w-0 break-all text-muted-foreground">
          Paid to{" "}
          <span className="text-foreground">
            {email || "no payout email yet"}
          </span>
        </span>
        <button
          ref={changeRef}
          type="button"
          onClick={() => {
            setValue(email || "");
            setEditing(true);
          }}
          className="cursor-pointer border-0 bg-transparent p-0 font-body text-sm text-brand underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
        >
          {email ? "Change" : "Add"}
          <span className="sr-only"> payout email</span>
        </button>
        <span className="text-emerald-600" role="status">
          {saved ? "Saved" : ""}
        </span>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cn("flex flex-wrap items-start gap-2", className)}
    >
      <label htmlFor="aff-payout-email" className="sr-only">
        Payout email
      </label>
      <input
        ref={inputRef}
        id="aff-payout-email"
        type="email"
        autoComplete="email"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && close()}
        aria-invalid={error ? true : undefined}
        aria-errormessage={error ? "aff-payout-email-error" : undefined}
        className={cn(fieldClass, "min-w-0 flex-1 basis-full py-2 xs:basis-56")}
      />
      <button
        type="submit"
        disabled={update.isLoading}
        className={cn(ghostBtn, "border-brand/60 text-brand")}
      >
        {update.isLoading ? "Saving…" : "Save"}
      </button>
      <button type="button" onClick={close} className={ghostBtn}>
        Cancel
      </button>
      {error && (
        <p
          id="aff-payout-email-error"
          role="alert"
          className="m-0 basis-full font-body text-xs text-destructive"
        >
          {error}
        </p>
      )}
    </form>
  );
};

export default PayoutEmail;
