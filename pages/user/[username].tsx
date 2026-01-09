import React from "react";
import { useRouter } from "next/router";
import { Layout, Loading } from "@components/components";
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
