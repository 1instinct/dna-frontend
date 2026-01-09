import React, { useState } from "react";
import Link from "next/link";
import { Formik, Field, useFormikContext } from "formik";
import { useQueryClient } from "react-query";
import styled from "@emotion/styled";

import { loginForm } from "@components/AuthForm/constants";
import { useAuth } from "@config/auth";
import { Dialog } from "@components/shared/Dialog";
import { FormikInput, FormikPassword } from "../FormikWrappers";
import { Button } from "@components/shared";
import constants from "@utilities/constants";

const ErrorMessageDisplay = styled.div`
  color: ${(p) => p.theme.colors.red?.primary || "#ff0000"};
  padding: 10px;
  margin: 10px 0;
  background: ${(p) => p.theme.colors.red?.light || "#ffe6e6"};
  border-radius: 4px;
  font-size: 14px;
`;

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Subtext = styled.div`
  text-align: center;
  margin-top: 16px;
  color: ${(p) => p.theme.colors.white.primary};
  opacity: 0.7;
  font-size: 14px;

  a {
    color: ${(p) => p.theme.colors.brand.primary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginDialog: React.FC<LoginDialogProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [loginError, setLoginError] = useState<string | null>(null);
  const { login } = useAuth();
  const queryClient = useQueryClient();

  const SubmitButton = () => {
    const { submitForm, isSubmitting } = useFormikContext();
    return (
      <Button onClick={submitForm} disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Submit"}
      </Button>
    );
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Login">
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
              constants.IS_DEBUG && console.log("LOGIN SUCCESS: ", result);

              await queryClient.invalidateQueries("CART");
              constants.IS_DEBUG && console.log("Cart cache invalidated");

              // Small delay to ensure everything is synced
              await new Promise((resolve) => setTimeout(resolve, 200));

              // Call success callback and close dialog
              onSuccess?.();
              onClose();
            } else {
              setLoginError(
                "Login failed. Please check your credentials and try again."
              );
              setSubmitting(false);
            }
          } catch (e: any) {
            constants.IS_DEBUG && console.error("LOGIN FAIL: ", e);
            const errorMessage =
              e?.message ||
              "Login failed. Please check your credentials and try again.";
            setLoginError(errorMessage);

            if (
              errorMessage.toLowerCase().includes("email") ||
              errorMessage.toLowerCase().includes("password")
            ) {
              setFieldError("password", "Invalid email or password");
            }

            setSubmitting(false);
          }
        }}
      >
        {() => (
          <FormWrapper>
            {loginError && (
              <ErrorMessageDisplay>{loginError}</ErrorMessageDisplay>
            )}
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
                name="password"
                placeholder="Password"
                component={FormikPassword}
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
    </Dialog>
  );
};
