import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Formik, Form } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useAuth } from "../../config/auth";
import { Questions } from "./Questions";
import { Alert } from "../Alerts";
import constants from "@utilities/constants";

export const SignupWizard = () => {
  const router = useRouter();
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const step = Questions[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === Questions.length - 1;

  const initialValues = useMemo(
    () =>
      Questions.reduce(
        (acc, q) => ({ ...acc, ...(q.initialValues || {}) }),
        {} as Record<string, any>
      ),
    []
  );

  const goNext = useCallback(
    async (values: any, validateForm: any, setTouched: any) => {
      if (step.validationSchema) {
        try {
          await step.validationSchema.validate(values, { abortEarly: false });
        } catch {
          // Mark all current step fields as touched to show errors
          const fields = Object.keys(step.initialValues || {});
          const touched = fields.reduce(
            (acc, f) => ({ ...acc, [f]: true }),
            {}
          );
          setTouched(touched, true);
          return;
        }
      }

      if (step.onAction) {
        try {
          step.onAction(values);
        } catch {
          return;
        }
      }

      setDirection(1);
      setCurrentStep((s) => Math.min(s + 1, Questions.length - 1));
      window.scrollTo(0, 0);
    },
    [step]
  );

  const goBack = useCallback(() => {
    setDirection(-1);
    setCurrentStep((s) => Math.max(s - 1, 0));
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = useCallback(
    async (values: any, { setSubmitting }: any) => {
      try {
        const res = await register({ user: values });
        constants.IS_DEBUG && console.log("Registration successful:", res);
        router.push("/account");
      } catch (err) {
        const errorMessage =
          err && typeof err === "object" && "message" in err
            ? (err as { message?: string }).message
            : String(err);
        Alert.fire({ icon: "error", title: "Uh oh!", text: errorMessage });
      } finally {
        setSubmitting(false);
      }
    },
    [register, router]
  );

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0
    })
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{
        background:
          "linear-gradient(180deg, #0A0020 0%, #1a0040 50%, #0A0020 100%)"
      }}
    >
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            {Questions.map((q, i) => (
              <div key={q.id} className="flex flex-1 items-center">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold transition-all duration-300 ${
                    i < currentStep
                      ? "border-neon-cyan bg-neon-cyan/20 text-neon-cyan"
                      : i === currentStep
                        ? "border-neon-cyan text-neon-cyan shadow-[0_0_12px_rgba(0,255,255,0.4)]"
                        : "border-white/20 text-white/30"
                  }`}
                >
                  {i < currentStep ? "\u2713" : i + 1}
                </div>
                {i < Questions.length - 1 && (
                  <div className="mx-1 h-px flex-1">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        background:
                          i < currentStep
                            ? "linear-gradient(90deg, #00ffff, #00ffff)"
                            : "rgba(255,255,255,0.1)"
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="font-micro5 text-xs tracking-widest text-white/50">
            Step {currentStep + 1} of {Questions.length} &mdash; {step.label}
          </p>
        </div>

        {/* Form card */}
        <Formik
          initialValues={initialValues}
          validationSchema={isLastStep ? step.validationSchema : undefined}
          onSubmit={handleSubmit}
          validateOnChange={false}
          validateOnBlur={true}
        >
          {({ values, validateForm, setTouched, isSubmitting }) => (
            <Form>
              <div className="glass-panel overflow-hidden p-6 sm:p-8">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={step.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                  >
                    <step.component />
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="mt-6 flex items-center gap-3">
                  {!isFirstStep && (
                    <button
                      type="button"
                      onClick={goBack}
                      className="neon-btn flex items-center gap-1 text-xs"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </button>
                  )}
                  <div className="flex-1" />
                  {isLastStep ? (
                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        !(values.acceptPrivacyTerms && values.acceptReportingTerms)
                      }
                      className="neon-btn flex items-center gap-1 text-xs disabled:pointer-events-none disabled:opacity-40"
                    >
                      {isSubmitting ? "Submitting..." : step.actionLabel}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => goNext(values, validateForm, setTouched)}
                      className="neon-btn flex items-center gap-1 text-xs"
                    >
                      {step.actionLabel}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Login link */}
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
