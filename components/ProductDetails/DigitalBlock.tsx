import React, { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "react-query";
import { Download, FileDown } from "lucide-react";
import { Button } from "@components/ui";
import { useDigitalSummary, claimFree } from "@hooks/useLibrary";
import { QueryKeys } from "@hooks/queryKeys";
import { apiErrorMessage } from "../../lib/api/v1";
import { DigitalKind, kindLabel } from "../../lib/digitalKinds";
import { includedLine } from "../../lib/library";
import { loginRedirectFor } from "../../lib/digitalCheckout";

/**
 * The digital part of a product page: that it is a download, what the
 * download holds, and, for a free product, a claim straight into the
 * library.
 */
export const DigitalBlock: React.FC<{
  slug: string;
  kind: DigitalKind;
  variantId: string;
  free: boolean;
  signedIn: boolean;
}> = ({ slug, kind, variantId, free, signedIn }) => {
  const { data: summary } = useDigitalSummary(slug);
  const queryClient = useQueryClient();
  const [claimed, setClaimed] = useState(false);
  const claim = useMutation(() => claimFree(Number(variantId)), {
    onSuccess: () => {
      setClaimed(true);
      queryClient.invalidateQueries(QueryKeys.LIBRARY);
    }
  });
  const included = includedLine(summary);

  return (
    <section
      aria-label="Digital download"
      className="mt-6 rounded-xl border border-border/30 bg-card p-4 text-left"
    >
      <div className="flex items-start gap-3">
        <FileDown className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
        <div className="min-w-0">
          <p className="font-title text-sm font-semibold text-foreground">
            Digital download
          </p>
          <p className="mt-0.5 font-body text-xs text-muted-foreground">
            {kindLabel(kind)}
            {included && (
              <>
                {" · "}
                <span className="tabular-nums">{included}</span>
              </>
            )}
          </p>
          <p className="mt-1 font-body text-xs text-muted-foreground">
            After you buy it, it&apos;s in your{" "}
            <Link
              href="/account/library"
              className="text-brand underline-offset-2 hover:underline"
            >
              library
            </Link>
            , ready to download.
          </p>
        </div>
      </div>

      {free && (
        <div className="mt-3 border-t border-border/30 pt-3">
          {claimed ? (
            <p className="font-body text-sm text-foreground">
              It&apos;s in your library.{" "}
              <Link
                href="/account/library"
                className="text-brand underline-offset-2 hover:underline"
              >
                Open library
              </Link>
            </p>
          ) : signedIn ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => claim.mutate()}
                disabled={claim.isLoading || !variantId}
              >
                <Download aria-hidden />
                {claim.isLoading ? "Adding…" : "Add to library, free"}
              </Button>
              {claim.isError && (
                <p
                  role="alert"
                  className="mt-2 font-body text-xs text-destructive"
                >
                  {apiErrorMessage(
                    claim.error,
                    "Couldn't add it. Try adding it to your cart instead."
                  )}
                </p>
              )}
            </>
          ) : (
            <p className="font-body text-sm text-muted-foreground">
              <Link
                href={loginRedirectFor(`/${slug}`)}
                className="text-brand underline-offset-2 hover:underline"
              >
                Sign in
              </Link>{" "}
              to add it to your library for free.
            </p>
          )}
        </div>
      )}
    </section>
  );
};
