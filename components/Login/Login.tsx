import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Formik, Field, ErrorMessage, useFormikContext } from "formik";
import styled from "@emotion/styled";

import { loginForm } from "@components/AuthForm/constants";
import { useAuth } from "@config/auth";

import { FormikInput } from "../FormikWrappers";

import {
  LoginWrapper,
  FormWrapper,
  Title,
  InputWrapper,
  Subtext
} from "./Login.styles";
import constants from "@utilities/constants";
import { Button } from "@components/shared";

const ErrorMessageDisplay = styled.div`
  color: ${(p) => p.theme.colors.red?.primary || "#ff0000"};
  padding: 10px;
  margin: 10px 0;
  background: ${(p) => p.theme.colors.red?.light || "#ffe6e6"};
  border-radius: 4px;
  font-size: 14px;
`;

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  // Get redirect URL from query params (set by middleware)
  const redirectUrl = (router.query.redirect as string) || "/";

  // Component to handle button click
  const SubmitButton = () => {
    const { submitForm, isSubmitting } = useFormikContext();
    return (
      <Button onClick={submitForm} disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Submit"}
      </Button>
    );
  };

  return (
    <LoginWrapper>
      <Title>{loginForm.title}</Title>
      <Formik
        initialValues={loginForm.fields}
        validationSchema={loginForm.validate}
        validateOnChange={true}
        validateOnBlur={true}
        onSubmit={async (values, { setSubmitting, setFieldError }) => {
          try {
            setSubmitting(true);
            setLoginError(null);
            
            const result = await login(values);
            
            if (result) {
              // Redirect to the original URL or home on successful login
              constants.IS_DEBUG && console.log("LOGIN SUCCESS: ", result);
              constants.IS_DEBUG && console.log("Redirect URL: ", redirectUrl);
              constants.IS_DEBUG && console.log("Cookie after login: ", document.cookie);
              
              // Small delay to ensure cookie is fully written
              await new Promise(resolve => setTimeout(resolve, 100));
              
              // Use window.location for full page reload to ensure middleware picks up the cookie
              router.push(redirectUrl);
            } else {
              // This shouldn't happen with the updated auth.ts, but just in case
              setLoginError("Login failed. Please check your credentials and try again.");
              setSubmitting(false);
            }
          } catch (e: any) {
            constants.IS_DEBUG && console.error("LOGIN FAIL: ", e);
            const errorMessage = e?.message || "Login failed. Please check your credentials and try again.";
            setLoginError(errorMessage);
            
            // Also set field errors if it's a credentials issue
            if (errorMessage.toLowerCase().includes("email") || errorMessage.toLowerCase().includes("password")) {
              setFieldError("password", "Invalid email or password");
            }
            
            setSubmitting(false);
          }
        }}
      >
        {() => (
          <FormWrapper>
            {loginError && <ErrorMessageDisplay>{loginError}</ErrorMessageDisplay>}
            <InputWrapper>
              <Field
                type="email"
                name="username"
                placeholder="Email"
                component={FormikInput}
                label="Email"
              />
            </InputWrapper>
            <InputWrapper>
              <Field
                type="password"
                name="password"
                placeholder="Password"
                component={FormikInput}
                label="Password"
              />
            </InputWrapper>
            <SubmitButton />
            <Subtext>
              <Link href="/signup">Signup</Link>
              &nbsp;&nbsp;|&nbsp;&nbsp;
              <Link href="/reset-password">Reset Password</Link>
            </Subtext>
          </FormWrapper>
        )}
      </Formik>
    </LoginWrapper>
  );
};
