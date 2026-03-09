import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Formik, Form, Field } from "formik";
import { object, string, bool, ref } from "yup";

import { useAuth } from "../../config/auth";
import { FormikInput, FormikPassword } from "../FormikWrappers";
import { Alert } from "../Alerts";
import constants from "@utilities/constants";

const SignupSchema = object().shape({
  email: string().email("Invalid email").required("Required"),
  password: string()
    .min(6, "Too Short")
    .matches(
      constants.PASSWORD_REGEX,
      "Must include uppercase, lowercase, and number"
    )
    .required("Required"),
  passwordConfirm: string()
    .required("Required")
    .oneOf([ref("password"), null], "Passwords must match"),
  acceptTerms: bool().oneOf([true], "You must accept the terms")
});

export const SignupWizard = () => {
  const router = useRouter();
  const { register, login } = useAuth();
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    setServerError("");
    try {
      await register({
        user: {
          email: values.email,
          password: values.password,
          password_confirmation: values.passwordConfirm
        }
      });

      // Auto-login after successful registration
      try {
        await login({ username: values.email, password: values.password });
        router.push("/account/profile?welcome=true");
      } catch {
        // If auto-login fails, redirect to login page
        router.push("/login");
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      setServerError(msg);
      Alert.fire({ icon: "error", title: "Registration failed", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-gradient-shift flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="font-pressstart text-center text-lg text-white mb-2">
          Create Account
        </h1>
        <p className="font-micro5 text-center text-xs tracking-widest text-white/50 mb-8">
          Join the Beeper marketplace
        </p>

        <Formik
          initialValues={{
            email: "",
            password: "",
            passwordConfirm: "",
            acceptTerms: false
          }}
          validationSchema={SignupSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, values }) => (
            <Form>
              <div className="glass-panel p-6 sm:p-8 space-y-4">
                {serverError && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                    {serverError}
                  </div>
                )}

                <Field name="email" component={FormikInput} label="Email" />
                <Field
                  name="password"
                  component={FormikPassword}
                  label="Password"
                />
                <Field
                  name="passwordConfirm"
                  component={FormikPassword}
                  label="Confirm Password"
                />

                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Field
                      type="checkbox"
                      name="acceptTerms"
                      className="mt-1 accent-cyan-400"
                    />
                    <span className="text-xs text-white/60">
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="text-neon-cyan hover:underline"
                      >
                        Terms & Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-neon-cyan hover:underline"
                      >
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !values.acceptTerms}
                  className="neon-btn w-full text-center text-xs disabled:pointer-events-none disabled:opacity-40"
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </button>
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="font-title text-xs text-white/40 transition-colors hover:text-neon-cyan"
                >
                  Already have an account?
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
