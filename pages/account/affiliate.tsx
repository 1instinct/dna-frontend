import React, { useState } from "react";
import Head from "next/head";
import { useAuth } from "@config/auth";
import { useAffiliate } from "@hooks/useAffiliate";
import {
  ApplyForm,
  Dashboard,
  StatusCard,
  Terms
} from "../../components/Affiliate";
import { ProtectedRoute } from "../../components/shared/ProtectedRoute";
import AccountPageLayout from "./AccountPageLayout";

const AffiliatePage = () => {
  const { user } = useAuth();
  const { data: affiliate, isLoading, isError, refetch } = useAffiliate(!!user);
  const email = user?.data?.attributes?.email;
  const [reapplying, setReapplying] = useState(false);

  let content: React.ReactNode;
  if (!user || isLoading) {
    content = (
      <div className="grid gap-5" aria-busy>
        <div className="rounded-xl border border-border/30 bg-card h-48 animate-pulse" />
        <div className="rounded-xl border border-border/30 bg-card h-72 animate-pulse" />
      </div>
    );
  } else if (isError) {
    content = (
      <div className="rounded-xl border border-border/30 bg-card p-5">
        <p className="m-0 font-body text-sm text-muted-foreground">
          Your affiliate account didn&apos;t load.{" "}
          <button
            type="button"
            onClick={() => refetch()}
            className="cursor-pointer border-0 bg-transparent p-0 text-brand underline underline-offset-4"
          >
            Try again
          </button>
        </p>
      </div>
    );
  } else if (!affiliate) {
    content = (
      <div className="grid gap-5">
        <ApplyForm defaultEmail={email} />
        <Terms />
      </div>
    );
  } else if (affiliate.status === "rejected" && reapplying) {
    content = (
      <div className="grid gap-5">
        <ApplyForm
          defaultEmail={email}
          previous={affiliate}
          onCancel={() => setReapplying(false)}
        />
        <Terms />
      </div>
    );
  } else if (affiliate.status === "approved") {
    content = <Dashboard affiliate={affiliate} />;
  } else {
    content = (
      <div className="grid gap-5">
        <StatusCard
          affiliate={
            affiliate as typeof affiliate & {
              status: "pending" | "rejected" | "suspended";
            }
          }
          onApplyAgain={() => setReapplying(true)}
        />
        <Terms
          commissionBps={affiliate.commission_bps}
          cookieDays={affiliate.cookie_days}
        />
      </div>
    );
  }

  return (
    <AccountPageLayout>
      <Head>
        <title>Affiliate</title>
        <meta name="robots" content="noindex" />
      </Head>
      <ProtectedRoute>{content}</ProtectedRoute>
    </AccountPageLayout>
  );
};

export default AffiliatePage;
