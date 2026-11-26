import React, { useState } from "react";
import { Skeleton } from "@components/ui";
import { useCreator, useCreatorApplication } from "@hooks/useCreator";
import { ErrorNote, PageTitle } from "../CreatorPortal/kit";
import { ApplyForm } from "./ApplyForm";
import { ApplicationStatus, CreatorApproved } from "./ApplicationStatus";

/**
 * /account/creator: the application form, the application's status, or a
 * way into the creator portal once approved. For a signed-in user.
 */
export const CreatorApplicationView: React.FC = () => {
  const creator = useCreator();
  const application = useCreatorApplication();
  const [applyAgain, setApplyAgain] = useState(false);

  const loading = creator.isLoading || application.isLoading;
  const app = application.data;
  const isCreator = !!creator.data;

  let body: JSX.Element;
  if (loading) {
    body = <Skeleton className="h-48" />;
  } else if (application.error && !isCreator) {
    body = <ErrorNote error={application.error} />;
  } else if (isCreator || app?.status === "approved") {
    body = <CreatorApproved />;
  } else if (
    app &&
    (app.status === "pending" || (app.status === "rejected" && !applyAgain))
  ) {
    body = (
      <ApplicationStatus
        application={app}
        onApplyAgain={() => setApplyAgain(true)}
      />
    );
  } else {
    body = <ApplyForm />;
  }

  return (
    <div className="max-w-3xl">
      <PageTitle sub="Sell your own digital products in this store.">
        Become a creator
      </PageTitle>
      {body}
    </div>
  );
};
