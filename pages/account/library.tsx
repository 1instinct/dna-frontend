import React from "react";
import Head from "next/head";
import AccountPageLayout from "./AccountPageLayout";
import { LibraryView } from "@components/Library";
import { ProtectedRoute } from "@components/shared/ProtectedRoute";

const LibraryPage = () => (
  <AccountPageLayout>
    <Head>
      <title>Library</title>
    </Head>
    <ProtectedRoute>
      <h2 className="mb-4 font-title text-lg font-semibold text-foreground">
        Library
      </h2>
      <LibraryView enabled />
    </ProtectedRoute>
  </AccountPageLayout>
);

export default LibraryPage;
