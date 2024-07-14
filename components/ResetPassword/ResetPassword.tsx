import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Formik, Form, Field, ErrorMessage } from "formik";
import styled from "@emotion/styled";
import { FormikInput } from "../FormikWrappers";

import { resetPasswordForm } from "../AuthForm/constants";
import {
  ResetPasswordWrapper,
  FormWrapper,
  InputWrapper
} from "./ResetPassword.styles";

const FieldContainer = styled.div`
  margin: 15px 0px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`;

export const ResetPassword = () => {
  return (
    <ResetPasswordWrapper>
      <h1>{resetPasswordForm.title}</h1>
      <Formik
        initialValues={resetPasswordForm.fields}
        validationSchema={resetPasswordForm.validate}
        onSubmit={(values, { setSubmitting }) => {
          resetPasswordForm
            .onSubmit(values)
            .then(() => {
              setSubmitting(false);
            })
            .catch(() => {
              setSubmitting(false);
            });
        }}
      >
        {({ isSubmitting }) => (
          <FormWrapper>
            <InputWrapper>
              <Field
                type="email"
                name="username"
                component={FormikInput}
                label="Email"
              />
            </InputWrapper>
            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
            <p>
              <Link href="/login">Login</Link>
              &nbsp;&nbsp;|&nbsp;&nbsp;
              <Link href="/authenticate/signup">Register</Link>
            </p>
          </FormWrapper>
        )}
      </Formik>
    </ResetPasswordWrapper>
  );
};
