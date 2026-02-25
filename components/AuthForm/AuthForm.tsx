import * as React from "react";
import { SignupWizard } from "../SignupWizard";
import { Login } from "../Login";
import { ResetPassword } from "../ResetPassword";
import { AuthFormType } from "./constants";
import { SignupForm } from "@components/SignupForm";

const isSimpleSignup =
  (process.env.NEXT_PUBLIC_SIMPLE_SIGNUP || "true") === "true";

interface Props {
  formType: AuthFormType;
}

export const AuthForm = ({ formType }: Props) => {
  switch (formType) {
    case AuthFormType.login:
      return <Login />;
    case AuthFormType.signup:
      return isSimpleSignup ? <SignupForm /> : <SignupWizard />;
    case AuthFormType.reset_password:
      return <ResetPassword />;
    default:
      return null;
  }
};
