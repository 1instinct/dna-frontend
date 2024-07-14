import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Formik, Form, Field, ErrorMessage } from "formik";
import styled from "@emotion/styled";
import { SignupForm } from "../SignupForm";
import { Login } from "../Login";
import { ResetPassword } from "../ResetPassword";

import { AuthFormType } from "./constants";
import { useAuth } from "../../config/auth";

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
  switch (formType) {
    case AuthFormType.login:
      return <Login />;
    case AuthFormType.signup:
      return <SignupForm />;
    case AuthFormType.reset_password:
      return <ResetPassword />;
    default:
      return null;
  }
};
