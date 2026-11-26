import React from "react";
import { useRouter } from "next/router";
import { Button } from "@components/ui";
import { useAuth } from "@config/auth";
import { REVIEWS_ENABLED } from "@lib/reviews";
import {
  AccountReviews,
  AccountReviewsTab
} from "../../components/Reviews/AccountReviews";
import AccountPageLayout from "./AccountPageLayout";

/** `/account/reviews` (middleware already sends signed-out visitors to login). */
const AccountReviewsPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const tab: AccountReviewsTab =
    router.query.tab === "mine" ? "mine" : "to-review";

  const setTab = (next: AccountReviewsTab) => {
    router.replace(
      {
        pathname: router.pathname,
        query: next === "mine" ? { tab: "mine" } : {}
      },
      undefined,
      { shallow: true, scroll: false }
    );
  };

  let content: React.ReactNode;
  if (!REVIEWS_ENABLED) {
    content = (
      <p className="font-body text-sm text-muted-foreground">
        Reviews aren&apos;t available yet.
      </p>
    );
  } else if (!user) {
    content = (
      <div className="grid justify-items-center gap-4 rounded-xl bg-card px-5 py-16 text-center">
        <p className="m-0 font-body text-sm text-muted-foreground">
          Please log in to see your reviews.
        </p>
        <Button
          onClick={() =>
            router.push(
              `/login?redirect=${encodeURIComponent("/account/reviews")}`
            )
          }
        >
          Log In
        </Button>
      </div>
    );
  } else {
    content = <AccountReviews initialTab={tab} onTabChange={setTab} />;
  }

  return <AccountPageLayout>{content}</AccountPageLayout>;
};

export default AccountReviewsPage;
