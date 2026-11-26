import React from "react";
import Head from "next/head";
import Link from "next/link";
import { Layout } from "../components/Layout";
import { useAuth } from "@config/auth";
import { useAffiliate } from "@hooks/useAffiliate";
import { formatBps } from "@lib/affiliate/stats";
import { Button } from "@components/ui";
import {
  CONTACT_EMAIL,
  DEFAULT_COMMISSION_BPS,
  DEFAULT_COOKIE_DAYS,
  HOLD_DAYS,
  SITE_TITLE
} from "@lib/affiliate/terms";

const RATE = formatBps(DEFAULT_COMMISSION_BPS);
const APPLY_PATH = "/account/affiliate";
const SITE_NAME = SITE_TITLE || "this store";

const STEPS = [
  {
    title: "Apply",
    copy: "Tell us where you publish and who your audience is. We read every application."
  },
  {
    title: "Share your link",
    copy: "Pick a code, link any page on the shop, or print the QR code for an event."
  },
  {
    title: "Earn on orders",
    copy: `Anyone who buys within ${DEFAULT_COOKIE_DAYS} days of clicking your link earns you ${RATE} of the order.`
  },
  {
    title: "Get paid",
    copy: `After a ${HOLD_DAYS}-day hold for returns, the commission is approved and paid to your payout email.`
  }
];

const FACTS = [
  { value: RATE, label: "of every order you send us" },
  {
    value: `${DEFAULT_COOKIE_DAYS}-day window`,
    label: "for a click to turn into an order"
  },
  {
    value: `${HOLD_DAYS}-day hold`,
    label: "before a commission is approved"
  }
];

const FAQ = [
  {
    q: "Who can apply?",
    a: "Anyone with an account and an audience who'd care: creators, reviewers, teachers, shops, podcasters, community organizers."
  },
  {
    q: "What counts toward my commission?",
    a: "The item total after discounts. Shipping and tax don't count, and neither do your own orders."
  },
  {
    q: "What if someone clicks two affiliate links?",
    a: "The most recent link gets the order."
  },
  {
    q: "What do I see about buyers?",
    a: "The last four characters of each order number and the amounts. Never names or email addresses."
  }
];

const AffiliatesPage = () => {
  const { user } = useAuth();
  // null once we know the shopper hasn't applied; undefined while unknown.
  const { data: affiliate } = useAffiliate(!!user);
  const ctaHref = user
    ? APPLY_PATH
    : `/login?redirect=${encodeURIComponent(APPLY_PATH)}`;
  const ctaLabel = !user
    ? "Sign in to apply"
    : affiliate === null
    ? "Apply"
    : "Open affiliate dashboard";

  return (
    <Layout>
      <Head>
        <title>
          {SITE_TITLE
            ? `Affiliate program | ${SITE_TITLE}`
            : "Affiliate program"}
        </title>
        <meta
          name="description"
          content={`Share ${SITE_NAME} and earn ${RATE} on every order placed through your link.`}
        />
      </Head>

      <div className="section-container py-14 sm:py-20">
        {/* Hero: the thing an affiliate actually gets, a link. */}
        <section className="mx-auto max-w-3xl">
          <h1 className="m-0 font-title font-semibold text-[26px] leading-[1.25] text-foreground sm:text-[40px]">
            Share {SITE_NAME}. Earn {RATE} of every order.
          </h1>
          <p className="mb-0 mt-5 max-w-[60ch] font-body text-base leading-7 text-muted-foreground">
            The affiliate program pays you for the people you send our way. You
            get a link with your own code, live stats on clicks and orders, and
            a commission on everything they buy.
          </p>

          <div
            className="mt-8 rounded-lg border border-brand/35 bg-muted px-4 py-3.5"
            aria-label="Example affiliate link"
          >
            <p className="m-0 break-all font-body text-[15px] leading-6 text-foreground/55 sm:text-lg">
              example.com/<span className="text-foreground">browse</span>
              ?ref=<span className="text-brand">yourname</span>
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button asChild>
              <Link href={ctaHref} className="no-underline">
                {ctaLabel}
              </Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-3xl" aria-label="Program terms">
          <dl className="m-0 grid gap-px overflow-hidden rounded-lg border border-border/30 bg-border/30 sm:grid-cols-3">
            {FACTS.map((f) => (
              <div
                key={f.label}
                className="flex flex-col-reverse bg-card px-5 py-4"
              >
                <dt className="mt-1 font-body text-sm leading-5 text-foreground/55">
                  {f.label}
                </dt>
                <dd className="m-0 font-body text-2xl leading-8 text-foreground">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="m-0 mb-6 font-title font-semibold text-base leading-6 text-foreground">
            How it works
          </h2>
          <ol className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className="rounded-xl border border-border/30 bg-card flex gap-4 p-4"
              >
                <span
                  className="font-body text-sm leading-6 text-brand"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="m-0 font-title font-semibold text-[13px] leading-6 text-foreground">
                    {s.title}
                  </h3>
                  <p className="m-0 mt-1 font-body text-sm leading-6 text-muted-foreground">
                    {s.copy}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="m-0 mb-6 font-title font-semibold text-base leading-6 text-foreground">
            Questions
          </h2>
          <dl className="m-0 divide-y divide-border/30 border-y border-border/30">
            {FAQ.map((f) => (
              <div key={f.q} className="py-4">
                <dt className="font-body text-[15px] leading-6 text-foreground">
                  {f.q}
                </dt>
                <dd className="m-0 mt-1 max-w-[65ch] font-body text-sm leading-6 text-muted-foreground">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
          {CONTACT_EMAIL && (
            <p className="mb-0 mt-6 font-body text-sm text-foreground/55">
              Something else?{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=Affiliate%20program`}
                className="text-brand underline underline-offset-4"
              >
                Email {CONTACT_EMAIL}
              </a>
            </p>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default AffiliatesPage;
