import React from "react";
import Head from "next/head";
import AccountPageLayout from "./AccountPageLayout";
import { CreatorApplicationView } from "@components/Creator";
import { ProtectedRoute } from "@components/shared/ProtectedRoute";

const AccountCreatorPage = () => (
  <AccountPageLayout>
    <Head>
      <title>Become a creator</title>
    </Head>
    <ProtectedRoute>
      <CreatorApplicationView />
    </ProtectedRoute>
  </AccountPageLayout>
);

export default AccountCreatorPage;
