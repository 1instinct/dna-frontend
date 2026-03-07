import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Formik, Field, useFormikContext } from "formik";
import { useQueryClient } from "react-query";
import { ArrowLeft } from "lucide-react";

import { loginForm } from "@components/AuthForm/constants";
import { useAuth } from "@config/auth";
import { FormikInput, FormikPassword } from "../FormikWrappers";
import { Button } from "@components/ui";
import constants from "@utilities/constants";

export const Login = () => {
  const [loginError, setLoginError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const redirectUrl = (router.query.redirect as string) || "/";

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  const SubmitButton = () => {
    const { submitForm, isSubmitting } = useFormikContext();
    return (
      <Button
        onClick={submitForm}
        disabled={isSubmitting}
        className="neon-btn w-full py-3"
      >
        {isSubmitting ? "Logging in..." : "Submit"}
      </Button>
    );
  };

  return (
    <div className="mx-4 my-6 sm:mx-auto sm:my-10 glass-panel w-full max-w-md p-6 sm:p-10">
      <button
        onClick={handleBack}
        className="mb-4 flex items-center gap-1.5 border-none bg-transparent p-0 font-body text-sm text-white/50 transition-colors hover:text-neon-cyan cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      <h1 className="mb-6 text-center font-pressstart text-sm text-neon-cyan">
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
              <div className="rounded-lg border border-neon-pink/30 bg-neon-pink/10 p-3 font-body text-sm text-neon-pink">
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
            <p className="mt-4 text-center font-body text-sm text-white/50">
              <Link
                href="/signup"
                className="text-neon-cyan transition-colors hover:underline"
              >
                Signup
              </Link>
              <span className="mx-2 text-white/30">|</span>
              <Link
                href="/reset-password"
                className="text-neon-cyan transition-colors hover:underline"
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
