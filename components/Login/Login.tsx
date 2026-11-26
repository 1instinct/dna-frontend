import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Formik, Field, useFormikContext } from "formik";
import { useQueryClient } from "react-query";

import { loginForm } from "@components/AuthForm/constants";
import { useAuth } from "@config/auth";
import { FormikInput, FormikPassword } from "../FormikWrappers";
import { Button } from "@components/ui";
import constants from "@utilities/constants";
import { safeRedirect } from "../../lib/safeRedirect";

export const Login = () => {
  const [loginError, setLoginError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Only a path on this site: an open redirect would let a crafted login link
  // send the shopper anywhere after signing in.
  const redirectUrl = safeRedirect(router.query.redirect);

  const SubmitButton = () => {
    // A plain submit button: the form's onSubmit runs Formik once. Calling submitForm on click
    // as well submitted twice.
    const { isSubmitting } = useFormikContext();
    return (
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Logging in..." : "Submit"}
      </Button>
    );
  };

  return (
    <div className="mx-auto my-10 w-full max-w-md rounded-xl border border-border/30 bg-card p-8 shadow-lg sm:p-10">
      <h1 className="mb-6 text-center font-title text-2xl font-bold uppercase tracking-wider text-foreground">
        {loginForm.title}
      </h1>
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
              constants.IS_DEBUG && console.log("Redirect URL: ", redirectUrl);

              await queryClient.invalidateQueries("CART");

              await new Promise((resolve) => setTimeout(resolve, 200));
              router.push(redirectUrl);
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
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {loginError}
              </div>
            )}
            <div>
              <Field
                type="email"
                name="username"
                id="login-email"
                placeholder="Email"
                component={FormikInput}
                label="Email"
                autoComplete="email"
                aria-required="true"
              />
            </div>
            <div>
              <Field
                name="password"
                id="login-password"
                placeholder="Password"
                component={FormikPassword}
                label="Password"
                autoComplete="current-password"
                aria-required="true"
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
    </div>
  );
};
