import * as React from "react";
import { Layout } from "@components/Layout";
import { AuthFormType } from "@components/AuthForm/constants";
import { AuthForm } from "@components/AuthForm";

const Signup = () => {
  return (
    <Layout>
      <AuthForm formType={AuthFormType.signup} />
    </Layout>
  );
};

export default Signup;
