import React from "react";
import Link from "next/link";
import { Button } from "@components/ui";
import { creatorSharePercent, sellableKinds } from "../../lib/marketplace";

const STEPS = [
  "Apply with a few examples of your work.",
  "Once approved, build products in the creator portal: upload the files, add a cover, set a price.",
  "Submit each product for review. An admin checks it and puts it live, or sends it back with a note.",
  "Buyers download it from their library. You see every sale and get paid out from your balance."
];

/** /creators: what selling here means, and the way to apply. */
export const CreatorsLanding: React.FC = () => {
  const share = creatorSharePercent();
  const kinds = sellableKinds();

  return (
    <div className="section-container py-10 sm:py-16">
      <div className="max-w-2xl">
        <h1 className="font-title text-3xl font-bold text-foreground sm:text-4xl">
          Sell your work here
        </h1>
        <p className="mt-4 font-body text-base text-muted-foreground sm:text-lg">
          Creators sell digital products in our marketplace. Buyers pay at
          checkout and download them from their library.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button asChild>
            <Link href="/account/creator" className="no-underline">
              Apply to sell
            </Link>
          </Button>
          <Link
            href="/browse?mode=marketplace"
            className="font-body text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            See the marketplace
          </Link>
        </div>
      </div>

      {share !== null && (
        <section
          className="mt-14 rounded-xl border border-border/30 bg-card p-5 sm:p-6"
          aria-labelledby="share"
        >
          <h2
            id="share"
            className="font-title text-base font-semibold text-foreground"
          >
            You keep {share}% of every sale
          </h2>
          <div
            className="mt-4 flex h-3 overflow-hidden rounded-full bg-muted"
            aria-hidden
          >
            <div className="bg-brand" style={{ width: `${share}%` }} />
          </div>
          <p className="mt-4 max-w-2xl font-body text-sm text-muted-foreground">
            The share is of the price the buyer paid after discounts. Earnings
            become payable after a hold period once the order completes, and
            refunded orders don&apos;t count.
          </p>
        </section>
      )}

      <section className="mt-10" aria-labelledby="sell">
        <h2
          id="sell"
          className="font-title text-base font-semibold text-foreground"
        >
          What you can sell
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {kinds.map((k) => (
            <li
              key={k.kind}
              className="rounded-lg border border-border/30 bg-card px-4 py-2 font-body text-sm text-foreground"
            >
              {k.plural}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="how">
        <h2
          id="how"
          className="font-title text-base font-semibold text-foreground"
        >
          How it works
        </h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className="rounded-xl border border-border/30 bg-card p-4"
            >
              <span className="font-title text-xs font-semibold tabular-nums text-brand">
                {i + 1}
              </span>
              <p className="mt-1 font-body text-sm text-muted-foreground">
                {s}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};
