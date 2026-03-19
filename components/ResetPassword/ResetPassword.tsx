import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Formik, Field, useFormikContext } from "formik";
import { ArrowLeft } from "lucide-react";
import { FormikInput } from "../FormikWrappers";
import { Button } from "@components/ui";
import { resetPasswordForm } from "../AuthForm/constants";

export const ResetPassword = () => {
  const router = useRouter();

  const handleBack = React.useCallback(() => {
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
        Reset Password
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
        {resetPasswordForm.title}
      </h1>
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
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Field
                type="email"
                name="username"
                component={FormikInput}
                label="Email"
                placeholder="Email"
              />
            </div>
            <SubmitButton />
            <p className="mt-4 text-center font-body text-sm text-white/50">
              <Link
                href="/login"
                className="text-neon-cyan transition-colors hover:underline"
              >
                Login
              </Link>
              <span className="mx-2 text-white/30">|</span>
              <Link
                href="/signup"
                className="text-neon-cyan transition-colors hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </form>
        )}
      </Formik>
    </div>
  );
};
