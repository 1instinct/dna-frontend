import { useCallback, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useMediaQuery } from "react-responsive";
import { Formik, Form, Field, ErrorMessage, FormikProps } from "formik";
import FormikWizard from "formik-wizard";
import { useFormikContext } from "formik";
import { withWizard } from "react-albus";
import { AuthFormType, signupForm } from "../AuthForm/constants";
import { useAuth } from "../../config/auth";
import { SlideInLeft, SlideOutLeft } from "../Animations";
import { Questions } from "./Questions";
import { Alert } from "../Alerts";
import { Button } from "@components/ui";

import FormikWizardStepType from "formik-wizard";

import constants from "@utilities/constants";
import { Loading } from "../Loading";
import { cn } from "@lib/utils";

const ThreeViewer = dynamic(
  () => import("@components/shared/ThreeViewer").then((mod) => mod.ThreeViewer),
  {
    loading: () => <Loading />,
    ssr: false
  }
);

const FormWrapper: React.FC<any> = ({
  steps,
  children,
  wizard,
  isLastStep,
  status,
  goToPreviousStep,
  canGoBack,
  hasError,
  isDirty,
  showNextStep,
  actionLabel
}: any) => {
  const isMobile = useMediaQuery({
    query: `(max-device-width: 768px)`
  });

  const { values }: any = useFormikContext();

  const termsAccepted = !!(
    values.acceptSignatureTerms && values.acceptPrivacyTerms
  );

  const keyboardListener = (e: any) => {
    if (e.keyCode === 13) {
      wizard.next();
      return true;
    }
    return false;
  };

  useEffect(() => {
    window.addEventListener("keydown", keyboardListener);
    return () => {
      window.removeEventListener("keydown", keyboardListener);
    };
  });

  switch (status ? status.code : status) {
    case 200:
      window.scrollTo(0, 0);
      return (
        <div className="flex flex-col items-center justify-center p-5 pt-4 text-center">
          <div className="pointer-events-none text-center text-2xl font-black uppercase text-foreground">
            {status.message}
          </div>
          <div className="pt-5 text-center text-xl text-foreground">
            {status.subtitle}
          </div>
        </div>
      );
    default:
      return (
        <div className="w-full rounded-lg bg-card pt-0 shadow-[0px_22px_33px_rgba(0,0,0,0.066)] md:mt-[165px] [&_[data-qa='title']]:text-[1.6rem] [&_[data-qa='title']]:text-brand">
          {children}
          <div className="mx-2.5 flex justify-between gap-4 px-4 pb-1 sm:mx-6">
            {canGoBack && (
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                disabled={!canGoBack}
                className="flex-[0.3] flex-grow"
              >
                <i className="bts bt-angles-left" />
              </Button>
            )}
            {isLastStep ? (
              <Button
                onClick={() => {
                  console.log("next: ", values, wizard, isLastStep);
                  wizard.next();
                }}
                disabled={isLastStep && !termsAccepted}
                className="flex-[0.7] flex-grow"
              >
                {actionLabel || (isLastStep ? "Submit" : "Next")}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  constants.IS_DEBUG &&
                    console.log("next: ", values, wizard, isLastStep);
                  wizard.next();
                }}
                disabled={
                  (isLastStep && !termsAccepted) || hasError || !isDirty
                }
                className="flex-[0.7] flex-grow"
              >
                {actionLabel || (isLastStep ? "Submit" : "Next")}
              </Button>
            )}
          </div>
          {!canGoBack && (
            <div className="px-5 py-4 text-center text-[0.7rem] text-muted-foreground">
              <Link href="/login" className="text-brand hover:underline">
                Already have an account?
              </Link>
            </div>
          )}
          {canGoBack && (
            <div className="px-5 py-4 text-center text-[0.7rem] text-muted-foreground">
              Don&apos;t worry your information is safe{" "}
              <span role="img" aria-label="lock">
                🔐
              </span>{" "}
              and we never share your information without your consent.
              <div className="mt-2 flex justify-center px-4 py-4">
                <Link href="/login" className="text-brand hover:underline">
                  Already have an account?
                </Link>
              </div>
            </div>
          )}
        </div>
      );
  }
};

export const SignupWizard = () => {
  const isLargeDevice = useMediaQuery({
    query: `(min-device-width: 768px)`
  });

  const { register } = useAuth();

  const handleSubmit = useCallback((values: any) => {
    new Promise((resolve, reject) => {
      register({ user: values })
        .then((res) => {
          console.log("yup: ", res);
        })
        .catch((err) => {
          console.log("nope: ", err);
        });

      console.log("new Promise");
      return Promise.resolve({
        code: 200,
        status: 200,
        message: "Congrats!",
        subtitle: `Your new User ID is: ###`
      });
    })
      .then((res) => {
        console.log("handleSubmit res: ", res);
      })
      .catch((err) => {
        console.log("handleSubmit error: ", err);
        Alert.fire({ icon: "error", title: "Uh oh!", text: err });
      });
  }, []);

  return (
    <div className="relative z-[1] flex flex-col pb-20">
      <div className="mx-[10%] flex flex-row flex-nowrap justify-center sm:mx-[5%] sm:flex-col">
        <div className="relative mr-4 flex flex-[0_0_48%] flex-col rounded-lg bg-card p-4 text-center sm:mr-0 sm:mt-4 sm:hidden">
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 text-center text-2xl font-black uppercase text-foreground [text-shadow:0px_2px_22px_rgba(255,255,255,1)]">
            Enjoy The Journey{" "}
            <span role="img" aria-label="sunglasses">
              😎
            </span>
          </div>
        </div>
        <div
          className={cn(
            "flex flex-1 flex-col",
            isLargeDevice ? "w-[48%] max-w-[48%]" : "w-full max-w-full",
            "[&_form]:rounded-lg [&_form]:bg-card [&_form]:text-brand [&_form_[data-qa='title']]:text-[1.6rem] [&_form_[data-qa='title']]:text-brand",
            "sm:w-full sm:max-w-full"
          )}
        >
          <SlideInLeft>
            <FormikWizard
              steps={Questions}
              onSubmit={(values) => handleSubmit(values)}
              render={FormWrapper}
            />
          </SlideInLeft>
        </div>
      </div>
    </div>
  );
};
