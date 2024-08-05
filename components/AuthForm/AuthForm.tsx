import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTheme } from "@emotion/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import styled from "@emotion/styled";
import { SignupWizard } from "../SignupWizard";
import { Login } from "../Login";
import { ResetPassword } from "../ResetPassword";

import { AuthFormType } from "./constants";
import { useAuth } from "../../config/auth";
import { SignupForm } from "@components/SignupForm";

const FieldContainer = styled.div`
  margin: 15px 0px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`;

interface Props {
  formType: AuthFormType;
}

export const AuthForm = ({ formType }: Props) => {
  const theme = useTheme();

  switch (formType) {
    case AuthFormType.login:
      return <Login />;
    case AuthFormType.signup:
      return theme.isSimpleSignup ? <SignupForm /> : <SignupWizard />;
    case AuthFormType.reset_password:
      return <ResetPassword />;
    default:
      return null;
  }
};
