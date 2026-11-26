import * as React from "react";
import { Layout } from "@components/Layout";
import { AuthFormType } from "@components/AuthForm/constants";
import { AuthForm } from "@components/AuthForm";

const UpdateEmail = () => {
  return (
    <Layout>
      {/* The form is not built yet (AuthForm renders nothing), so the page's
          heading is for screen readers only. */}
      <h1 className="sr-only">Update email</h1>
      <AuthForm formType={AuthFormType.update_email} />
    </Layout>
  );
};

export default UpdateEmail;
