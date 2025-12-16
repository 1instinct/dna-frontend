import * as React from "react";
import { Layout } from "@components/Layout";
import { AuthFormType } from "@components/AuthForm/constants";
import { AuthForm } from "@components/AuthForm";

const UpdatePassword = () => {
  return (
    <Layout>
      <AuthForm formType={AuthFormType.update_password} />
    </Layout>
  );
};

export default UpdatePassword;
