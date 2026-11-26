import React, { useState, useCallback, createRef, useRef } from "react";
import { useRouter } from "next/router";
import { Carousel } from "react-responsive-carousel";
import { Formik, Form, Field, useFormikContext } from "formik";
import parse from "html-react-parser";

import constants from "@utilities/constants";
import { useAuth } from "@config/auth";
import { signupForm } from "@components/AuthForm/constants";
import TipBot from "@components/TipBot";
import Static from "@utilities/staticData";
import {
  FormikInput,
  FormikPassword,
  FormikCheckbox
} from "@components/FormikWrappers";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle
} from "@components/ui";
import { ElectronicSignaturesModal } from "@components/Terms/ElectronicSignaturesModal";
import { FinancialPrivacyModal } from "@components/Terms/FinancialPrivacyModal";

export const SignupForm = () => {
  const router = useRouter();
  const { register } = useAuth();
  const [openSignatureModal, setOpenSignatureModal] = useState(false);
  const [openPrivacyModal, setOpenPrivacyModal] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);

  const [signatureTerms, setSignatureCheckbox] = useState(false);
  const [privacyTerms, setPrivacyCheckbox] = useState(false);
  const [reportingTerms, setReportingCheckbox] = useState(false);
  const [authorizeTerms, setAuthorizeCheckbox] = useState(false);

  // The terms dialogs open from buttons outside a DialogTrigger, so focus is
  // returned to the opening button by hand when they close.
  const modalOpener = useRef<HTMLElement | null>(null);
  const rememberOpener = () => {
    modalOpener.current = document.activeElement as HTMLElement | null;
  };
  const restoreFocus = (e: Event) => {
    e.preventDefault();
    modalOpener.current?.focus();
  };

  const toggleSignatureModal = () => {
    rememberOpener();
    setOpenSignatureModal(!openSignatureModal);
  };

  const togglePrivacyModal = () => {
    rememberOpener();
    setOpenPrivacyModal(!openPrivacyModal);
  };

  const nextSlide = () => {
    setCurrentSlide(currentSlide + 1);
  };

  const handlePrivacyCheckbox = (field: any) => {
    setPrivacyCheckbox(!privacyTerms);
  };

  const handleReportingCheckbox = (field: any) => {
    setReportingCheckbox(!reportingTerms);
  };

  const speechMarkup = useCallback(() => {
    return { __html: "Signup for an account to get started." };
  }, []);

  const { title, subtitle, description } = Static.questions.account;

  return (
    <div className="relative z-[1] flex flex-col pb-20">
      <div className="mx-auto flex w-full max-w-2xl flex-row flex-wrap justify-center px-5 py-5 sm:px-10">
        <Formik
          initialValues={signupForm.fields}
          validationSchema={signupForm.validate}
          onSubmit={(values, { setSubmitting, setStatus }) => {
            setSubmitting(true);
            setStatus(undefined);
            // Spree's account endpoint takes { user: { email, password, password_confirmation } }.
            register({
              user: {
                email: values.email,
                password: values.password,
                password_confirmation: values.passwordConfirm
              }
            })
              .then(() => {
                setSubmitting(false);
                router.push("/");
              })
              .catch((e: any) => {
                constants.IS_DEBUG && console.log("SIGNUP FAIL: ", e);
                setStatus(
                  e?.message || "We couldn't create your account. Try again."
                );
                setSubmitting(false);
              });
          }}
        >
          {({ isSubmitting, handleSubmit, status }) => (
            <Form className="w-full rounded-xl border border-border/30 bg-card p-6 shadow-lg sm:p-8">
              <TipBot speech={speechMarkup()} />
              <div className="mt-4">
                <h1 className="mb-2 text-center font-title text-2xl font-bold uppercase tracking-wider text-foreground">
                  Signup
                </h1>
                <p className="mb-6 text-center font-body text-sm text-muted-foreground">
                  {parse(description)}
                </p>

                <div className="space-y-4">
                  <div>
                    <Field
                      name="email"
                      id="email"
                      type="email"
                      component={FormikInput}
                      label="Email"
                      autoComplete="email"
                      aria-required="true"
                    />
                  </div>

                  <div>
                    <Field
                      name="password"
                      id="password"
                      component={FormikPassword}
                      label="Password"
                      autoComplete="new-password"
                      aria-required="true"
                    />
                  </div>

                  <div>
                    <Field
                      name="passwordConfirm"
                      id="passwordConfirm"
                      component={FormikPassword}
                      label="Re-type Password"
                      autoComplete="new-password"
                      aria-required="true"
                    />
                  </div>
                </div>

                {/* Terms */}
                <div className="mt-6 rounded-lg border border-border/30 bg-muted/30 p-4">
                  <Carousel
                    showArrows={false}
                    showStatus={false}
                    showThumbs={false}
                    selectedItem={currentSlide}
                    onChange={setCurrentSlide}
                    // The library's dots are <li role="button">, which is not
                    // allowed in a list; a real button inside each dot is.
                    renderIndicator={(onClick, isSelected, index, label) => (
                      <li
                        key={index}
                        className={`dot${isSelected ? " selected" : ""}`}
                      >
                        <button
                          type="button"
                          onClick={onClick}
                          aria-label={`${label} ${index + 1}`}
                          aria-current={isSelected ? "true" : undefined}
                          className="block h-full w-full cursor-pointer rounded-full border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                      </li>
                    )}
                  >
                    <div className="flex items-start gap-3 pb-8 text-left">
                      <Field type="checkbox" name="acceptPrivacyTerms">
                        {(formikProps: any) => (
                          <FormikCheckbox
                            {...formikProps}
                            nextTerm={nextSlide}
                            accepted={privacyTerms}
                            handleTermCheckbox={handlePrivacyCheckbox}
                          />
                        )}
                      </Field>
                      <label
                        htmlFor="acceptPrivacyTerms"
                        className={`font-body text-sm ${
                          privacyTerms
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        I have received and read the{" "}
                        <button
                          type="button"
                          onClick={togglePrivacyModal}
                          className="cursor-pointer rounded-sm border-none bg-transparent p-0 font-semibold text-brand underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          Privacy Policy
                        </button>
                        .
                      </label>
                    </div>
                    <div className="flex items-start gap-3 pb-8 text-left">
                      <Field type="checkbox" name="acceptReportingTerms">
                        {(formikProps: any) => (
                          <FormikCheckbox
                            {...formikProps}
                            nextTerm={nextSlide}
                            accepted={reportingTerms}
                            handleTermCheckbox={handleReportingCheckbox}
                          />
                        )}
                      </Field>
                      <label
                        htmlFor="acceptReportingTerms"
                        className={`font-body text-sm ${
                          reportingTerms
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        By clicking &quot;Signup&quot; I agree to the{" "}
                        <button
                          type="button"
                          onClick={toggleSignatureModal}
                          className="cursor-pointer rounded-sm border-none bg-transparent p-0 font-semibold text-brand underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          Terms &amp; Conditions
                        </button>
                      </label>
                    </div>
                  </Carousel>
                </div>
              </div>

              {status && (
                <p
                  role="alert"
                  className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive"
                >
                  {status}
                </p>
              )}

              {/* Submit */}
              <div className="mt-6 flex justify-center">
                <Button
                  type="submit"
                  disabled={!(privacyTerms && reportingTerms)}
                  className="w-full max-w-xs"
                >
                  Submit
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      {/* Modals: the Dialog primitive traps focus, closes on Escape and
          returns focus to the button that opened it. */}
      <Dialog open={openSignatureModal} onOpenChange={setOpenSignatureModal}>
        <DialogContent
          aria-describedby={undefined}
          onCloseAutoFocus={restoreFocus}
          className="max-h-[80vh] max-w-2xl overflow-y-auto bg-card p-6"
        >
          <DialogTitle className="sr-only">Terms &amp; Conditions</DialogTitle>
          <ElectronicSignaturesModal />
          <DialogClose asChild>
            <button
              type="button"
              className="mt-4 w-full cursor-pointer rounded-lg border-none bg-brand px-4 py-2 font-title text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Close
            </button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      <Dialog open={openPrivacyModal} onOpenChange={setOpenPrivacyModal}>
        <DialogContent
          aria-describedby={undefined}
          onCloseAutoFocus={restoreFocus}
          className="max-h-[80vh] max-w-2xl overflow-y-auto bg-card p-6"
        >
          <DialogTitle className="sr-only">Privacy Policy</DialogTitle>
          <FinancialPrivacyModal />
          <DialogClose asChild>
            <button
              type="button"
              className="mt-4 w-full cursor-pointer rounded-lg border-none bg-brand px-4 py-2 font-title text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Close
            </button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
};
