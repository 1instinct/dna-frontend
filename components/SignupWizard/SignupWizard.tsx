import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Formik, Form, Field, FormikHelpers } from "formik";
import { object, string, bool, ref } from "yup";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Gift,
  ShoppingBag,
  Radio
} from "lucide-react";

import { useAuth } from "../../config/auth";
import { FormikInput, FormikPassword } from "../FormikWrappers";
import { Alert } from "../Alerts";
import constants from "@utilities/constants";

const STEPS = [
  { id: "welcome", label: "Welcome" },
  { id: "personal-info", label: "Info" },
  { id: "date-of-birth", label: "Birthday" },
  { id: "home-address", label: "Address" },
  { id: "yearly-income", label: "Income" },
  { id: "account", label: "Account" }
];

const stepSchemas: Record<string, ReturnType<typeof object>> = {
  "personal-info": object().shape({
    firstName: string().required("First name is required"),
    lastName: string().required("Last name is required")
  }),
  "date-of-birth": object().shape({
    dateOfBirth: string()
      .required("Date of birth is required")
      .test("age-check", "You must be at least 18 years old", (value) => {
        if (!value) return false;
        const dob = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
        return age >= 18;
      })
  }),
  "home-address": object().shape({
    homeAddress: string().required("Address is required")
  }),
  "yearly-income": object().shape({
    yearlyIncome: string().required("Income is required")
  }),
  account: object().shape({
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
  })
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0
  })
};

const dateInputClass =
  "neon-focus w-full rounded-lg border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm px-3 py-3 font-body text-sm text-white outline-none transition-all duration-300 placeholder:text-white/30 shadow-[inset_0_1px_3px_rgba(0,0,0,0.3),inset_0_-1px_0_rgba(255,255,255,0.04)] hover:border-white/[0.15] hover:bg-white/[0.06]";

export const SignupWizard = () => {
  const router = useRouter();
  const { register, login } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [serverError, setServerError] = useState("");
  const [direction, setDirection] = useState(1);

  const step = STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (values: any, helpers: FormikHelpers<any>) => {
    const schema = stepSchemas[step.id];
    if (schema) {
      try {
        await schema.validate(values, { abortEarly: false });
      } catch (err: any) {
        const errors: Record<string, string> = {};
        const touched: Record<string, boolean> = {};
        err.inner?.forEach((e: any) => {
          errors[e.path] = e.message;
          touched[e.path] = true;
        });
        helpers.setErrors(errors);
        helpers.setTouched(touched);
        helpers.setSubmitting(false);
        return;
      }
    }

    if (!isLast) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
      helpers.setSubmitting(false);
      return;
    }

    setServerError("");
    try {
      await register({
        user: {
          email: values.email,
          password: values.password,
          password_confirmation: values.passwordConfirm
        }
      });
      try {
        await login({ username: values.email, password: values.password });
        router.push("/account/profile?welcome=true");
      } catch {
        router.push("/login");
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      setServerError(msg);
      Alert.fire({ icon: "error", title: "Registration failed", text: msg });
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <div className="animate-gradient-shift flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Progress indicators */}
        <div className="mb-8">
          <div className="mb-3 flex justify-between">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`flex flex-col items-center ${
                  i <= currentStep ? "text-neon-cyan" : "text-white/20"
                }`}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold transition-all duration-300 ${
                    i < currentStep
                      ? "border-neon-cyan bg-neon-cyan/20 text-neon-cyan"
                      : i === currentStep
                      ? "border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(0,255,255,0.3)]"
                      : "border-white/20 text-white/20"
                  }`}
                >
                  {i < currentStep ? "\u2713" : i + 1}
                </div>
                <span className="mt-1 hidden font-micro5 text-[8px] tracking-wider sm:block">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </div>
        </div>

        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            dateOfBirth: "",
            homeAddress: "",
            unitNumber: "",
            yearlyIncome: "",
            email: "",
            password: "",
            passwordConfirm: "",
            acceptTerms: false
          }}
          onSubmit={handleSubmit}
        >
          {({
            values,
            isSubmitting,
            errors,
            touched,
            setFieldValue,
            setFieldTouched
          }) => (
            <Form>
              <div className="relative overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={step.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="glass-panel p-6 sm:p-8">
                      <h2 className="mb-1 text-center font-pressstart text-sm text-white">
                        {step.label}
                      </h2>
                      <p className="mb-6 text-center font-micro5 text-xs tracking-widest text-white/40">
                        Step {currentStep + 1} of {STEPS.length}
                      </p>

                      {serverError && step.id === "account" && (
                        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                          {serverError}
                        </div>
                      )}

                      {/* Welcome */}
                      {step.id === "welcome" && (
                        <div className="py-4 text-center">
                          <Sparkles className="mx-auto mb-4 h-10 w-10 text-neon-cyan" />
                          <p className="mx-auto max-w-xs font-body text-sm leading-relaxed text-white/60">
                            Create your account to start browsing, saving, and
                            getting deals on the marketplace.
                          </p>
                          <div className="mt-6 grid grid-cols-3 gap-2">
                            <div className="glass-panel p-3 text-center">
                              <Gift className="mx-auto mb-1 h-5 w-5 text-neon-pink/70" />
                              <span className="font-micro5 text-[10px] text-neon-cyan">
                                Free Ship
                              </span>
                            </div>
                            <div className="glass-panel p-3 text-center">
                              <ShoppingBag className="mx-auto mb-1 h-5 w-5 text-neon-purple/70" />
                              <span className="font-micro5 text-[10px] text-neon-cyan">
                                Rewards
                              </span>
                            </div>
                            <div className="glass-panel p-3 text-center">
                              <Radio className="mx-auto mb-1 h-5 w-5 text-neon-cyan/70" />
                              <span className="font-micro5 text-[10px] text-neon-cyan">
                                Live Stream
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Personal Info */}
                      {step.id === "personal-info" && (
                        <div className="space-y-4">
                          <p className="font-body text-sm text-white/50">
                            Let&apos;s start with your name.
                          </p>
                          <Field
                            name="firstName"
                            component={FormikInput}
                            label="First Name"
                          />
                          <Field
                            name="lastName"
                            component={FormikInput}
                            label="Last Name"
                          />
                        </div>
                      )}

                      {/* Date of Birth */}
                      {step.id === "date-of-birth" && (
                        <div className="space-y-4">
                          <p className="font-body text-sm text-white/50">
                            When is your birthday?
                          </p>
                          <div>
                            <input
                              type="date"
                              value={values.dateOfBirth}
                              onChange={(e) =>
                                setFieldValue("dateOfBirth", e.target.value)
                              }
                              onBlur={() =>
                                setFieldTouched("dateOfBirth", true)
                              }
                              className={dateInputClass}
                              style={{ colorScheme: "dark" }}
                            />
                            {touched.dateOfBirth && errors.dateOfBirth && (
                              <div className="mt-1 text-left font-body text-xs font-bold text-neon-pink">
                                {errors.dateOfBirth}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Home Address */}
                      {step.id === "home-address" && (
                        <div className="space-y-4">
                          <p className="font-body text-sm text-white/50">
                            Where do you currently live?
                          </p>
                          <Field
                            name="homeAddress"
                            component={FormikInput}
                            label="Home Address"
                          />
                          <Field
                            name="unitNumber"
                            component={FormikInput}
                            label="Apt / Unit (optional)"
                          />
                        </div>
                      )}

                      {/* Yearly Income */}
                      {step.id === "yearly-income" && (
                        <div className="space-y-4">
                          <p className="font-body text-sm text-white/50">
                            How much do you make each year?
                          </p>
                          <Field
                            name="yearlyIncome"
                            component={FormikInput}
                            label="Yearly Income (e.g. $50,000)"
                          />
                        </div>
                      )}

                      {/* Account Details */}
                      {step.id === "account" && (
                        <div className="space-y-4">
                          <Field
                            name="email"
                            component={FormikInput}
                            label="Email"
                          />
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
                            <label className="flex cursor-pointer items-start gap-3">
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
                                  Terms &amp; Conditions
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
                            {touched.acceptTerms && errors.acceptTerms && (
                              <div className="mt-1 font-body text-xs font-bold text-neon-pink">
                                {String(errors.acceptTerms)}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="mt-6 flex items-center justify-between gap-3">
                {!isFirst ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 font-title text-xs text-white/60 transition-all hover:border-white/[0.15] hover:text-white"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back
                  </button>
                ) : (
                  <div />
                )}
                {isLast ? (
                  <button
                    type="submit"
                    disabled={isSubmitting || !values.acceptTerms}
                    className="neon-btn flex items-center gap-1.5 text-xs disabled:pointer-events-none disabled:opacity-40"
                  >
                    {isSubmitting ? "Creating Account..." : "Create Account"}
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="neon-btn flex items-center gap-1.5 text-xs"
                  >
                    {isFirst ? "Get Started" : "Next"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
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
