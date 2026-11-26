import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Layout } from "@components/Layout";
import { ProtectedRoute } from "@components/shared/ProtectedRoute";
import { useAuth } from "@config/auth";
import { useCreator } from "@hooks/useCreator";
import { cn } from "@lib/utils";
import { Skeleton } from "@components/ui";
import { Chip, ErrorNote } from "./kit";

const NAV = [
  { href: "/creator", label: "Overview" },
  { href: "/creator/products", label: "Products" },
  { href: "/creator/sales", label: "Sales" },
  { href: "/creator/payouts", label: "Payouts" }
];

/**
 * Frame for /creator/*: sends guests to sign in, checks the user is a
 * creator (anyone else goes to /account/creator to apply), then renders the
 * portal nav and the page.
 */
export const PortalLayout: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  const router = useRouter();
  const { user } = useAuth();
  const creator = useCreator(!!user);

  useEffect(() => {
    if (creator.isSuccess && creator.data === null) {
      router.replace("/account/creator");
    }
  }, [creator.isSuccess, creator.data, router]);

  const active = (href: string) =>
    href === "/creator"
      ? router.pathname === "/creator"
      : router.pathname.startsWith(href);

  return (
    <Layout>
      <Head>
        <title>{`${title} | Creator portal`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <ProtectedRoute>
        <div className="section-container py-6 sm:py-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border/30 pb-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="font-title text-sm font-semibold text-brand">
                Creator portal
              </span>
              {creator.data?.profile?.handle && (
                <span className="truncate font-body text-sm text-muted-foreground">
                  @{creator.data.profile.handle}
                </span>
              )}
              {creator.data?.account?.status === "suspended" && (
                <Chip tone="danger">Suspended</Chip>
              )}
            </div>
            <nav
              aria-label="Creator portal"
              className="-mx-1 flex max-w-full gap-1 overflow-x-auto "
            >
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active(n.href) ? "page" : undefined}
                  className={cn(
                    "whitespace-nowrap rounded-md px-3 py-1.5 font-body text-sm no-underline transition-colors",
                    active(n.href)
                      ? "bg-brand/10 text-brand"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>

          {creator.isError ? (
            <ErrorNote
              error={creator.error}
              fallback="The creator portal didn't load. Refresh to try again."
            />
          ) : !creator.data ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-24" />
              <Skeleton className="h-64" />
            </div>
          ) : (
            children
          )}
        </div>
      </ProtectedRoute>
    </Layout>
  );
};
