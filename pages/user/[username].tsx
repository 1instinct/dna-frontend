import React from "react";
import { useRouter } from "next/router";
import { Layout } from "@components/Layout";
import { Loading } from "@components/Loading";
import { UserProfile } from "@components/UserProfile";

const UserProfilePage = () => {
  const router = useRouter();
  const { username } = router.query;

  if (!username || typeof username !== "string") {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout>
      <UserProfile username={username} />
    </Layout>
  );
};

export default UserProfilePage;
