import * as React from "react";
import { SignupWizard } from "../SignupWizard";
import { Login } from "../Login";
import { ResetPassword } from "../ResetPassword";
import { AuthFormType } from "./constants";

interface Props {
  formType: AuthFormType;
}

export const AuthForm = ({ formType }: Props) => {
  switch (formType) {
    case AuthFormType.login:
      return <Login />;
    case AuthFormType.signup:
      return <SignupWizard />;
    case AuthFormType.reset_password:
      return <ResetPassword />;
    default:
      return null;
  }
};
