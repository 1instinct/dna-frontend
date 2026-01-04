import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Formik, Form, Field, ErrorMessage, useFormikContext } from "formik";
import styled from "@emotion/styled";
import { FormikInput } from "../FormikWrappers";
import { Button } from "@components/shared";

import { resetPasswordForm } from "../AuthForm/constants";
import {
  ResetPasswordWrapper,
  FormWrapper,
  InputWrapper,
  Title,
  Subtext
} from "./ResetPassword.styles";

const FieldContainer = styled.div`
  margin: 15px 0px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`;

export const ResetPassword = () => {
  const SubmitButton = () => {
    const { submitForm, isSubmitting } = useFormikContext();
    return (
      <Button onClick={submitForm} disabled={isSubmitting}>
        Reset Password
      </Button>
    );
  };

  return (
    <ResetPasswordWrapper>
      <Title>{resetPasswordForm.title}</Title>
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
        {() => (
          <FormWrapper>
            <InputWrapper>
              <Field
                type="email"
                name="username"
                component={FormikInput}
                label="Email"
                placeholder="Email"
              />
            </InputWrapper>
            <SubmitButton />
            <Subtext>
              <Link href="/login">Login</Link>
              &nbsp;&nbsp;|&nbsp;&nbsp;
              <Link href="/signup">Sign Up</Link>
            </Subtext>
          </FormWrapper>
        )}
      </Formik>
    </ResetPasswordWrapper>
  );
};
