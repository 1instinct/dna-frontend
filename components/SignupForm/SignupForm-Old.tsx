import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Layout } from "../Layout";
import { Formik, Form, Field, ErrorMessage } from "formik";
import styled from "@emotion/styled";
import {
  AuthFormType,
  loginForm,
  signupForm,
  resetPasswordForm,
  updatePasswordForm,
  updateEmailForm
} from "../AuthForm/constants";
import { useAuth } from "../../config/auth";

const FieldContainer = styled.div`
  margin: 15px 0px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`;

export const SignupForm = () => {
  const { register } = useAuth();
  const router = useRouter();
  return (
    <>
      <h1>{signupForm.title}</h1>
      <Formik
        initialValues={signupForm.fields}
        validationSchema={signupForm.validate}
        onSubmit={(values, { setSubmitting }) => {
          register({ user: values })
            .then(() => {
              setSubmitting(false);
              router.push("/");
            })
            .catch(() => {
              setSubmitting(false);
            });
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <FieldContainer>
              <label>EMAIL</label>
              <Field type="email" name="email" />
              <ErrorMessage name="email" component="div" />
            </FieldContainer>

            <FieldContainer>
              <label>Password</label>
              <Field type="password" name="password" />
              <ErrorMessage name="password" component="div" />
            </FieldContainer>

            <FieldContainer>
              <label>Confirm Password</label>
              <Field type="password" name="password_confirmation" />
              <ErrorMessage name="password_confirmation" component="div" />
            </FieldContainer>
            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>

            <p>
              Already have an account{" "}
              <Link href="/login">
                <a>Log In</a>
              </Link>{" "}
              here
            </p>
          </Form>
        )}
      </Formik>
    </>
  );
};
