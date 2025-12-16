import * as React from "react";
import { Layout } from "@components/Layout";
import { AuthFormType } from "@components/AuthForm/constants";
import { AuthForm } from "@components/AuthForm";

const UpdateEmail = () => {
  return (
    <Layout>
      <AuthForm formType={AuthFormType.update_email} />
    </Layout>
  );
};

export default UpdateEmail;
