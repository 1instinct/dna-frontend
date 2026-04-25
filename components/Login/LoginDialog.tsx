import React, { useState } from "react";
import Link from "next/link";
import { Formik, Field, useFormikContext } from "formik";
import { useQueryClient } from "react-query";

import { loginForm } from "@components/AuthForm/constants";
import { useAuth } from "@config/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@components/ui";
import { FormikInput, FormikPassword } from "../FormikWrappers";
import { Button } from "@components/ui";
import constants from "@utilities/constants";

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
      <Button onClick={submitForm} disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Logging in..." : "Submit"}
      </Button>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-title text-xl uppercase tracking-wider">
            Login
          </DialogTitle>
          <DialogDescription className="sr-only">
            Log in to your account
          </DialogDescription>
        </DialogHeader>
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

                await new Promise((resolve) => setTimeout(resolve, 200));

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
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit} className="space-y-4">
              {loginError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {loginError}
                </div>
              )}
              <div>
                <Field
                  type="email"
                  name="username"
                  placeholder="Email"
                  component={FormikInput}
                  label="Email"
                />
              </div>
              <div>
                <Field
                  name="password"
                  placeholder="Password"
                  component={FormikPassword}
                  label="Password"
                />
              </div>
              <SubmitButton />
              <p className="mt-4 text-center font-body text-sm text-muted-foreground">
                <Link
                  href="/signup"
                  className="text-brand transition-colors hover:underline"
                >
                  Signup
                </Link>
                <span className="mx-2">|</span>
                <Link
                  href="/reset-password"
                  className="text-brand transition-colors hover:underline"
                >
                  Reset Password
                </Link>
              </p>
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};
