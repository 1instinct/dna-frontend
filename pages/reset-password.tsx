import * as React from "react";
import { Layout } from "../components";
import { AuthFormType } from "../components/AuthForm/constants";
import { AuthForm } from "../components/AuthForm";

const Authenticate = () => {
  return (
    <Layout>
      <AuthForm formType={AuthFormType.reset_password} />
    </Layout>
  );
};

export default Authenticate;
