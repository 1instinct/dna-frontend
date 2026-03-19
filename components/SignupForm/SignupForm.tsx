import React, { useState, useCallback, createRef } from "react";
import { useRouter } from "next/router";
import { Carousel } from "react-responsive-carousel";
import { Formik, Form, Field, useFormikContext } from "formik";
import parse from "html-react-parser";
import { ArrowLeft } from "lucide-react";

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
import { Button } from "@components/ui";
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

  const toggleSignatureModal = () => {
    setOpenSignatureModal(!openSignatureModal);
  };

  const togglePrivacyModal = () => {
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

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  const {
    title = "",
    subtitle = "",
    description = ""
  } = Static?.questions?.account || {};

  return (
    <div className="relative z-[1] flex flex-col pb-20">
      <div className="mx-4 flex w-full max-w-2xl flex-row flex-wrap justify-center py-5 sm:mx-auto sm:px-10">
        <Formik
          initialValues={signupForm.fields}
          validationSchema={signupForm.validate}
          onSubmit={(values, { setSubmitting }) => {
            setSubmitting(true);
            register(values)
              .then((res: any) => {
                console.log("LOGIN SUCCESS: ", res);
                setSubmitting(false);
                router.push("/");
              })
              .catch((e: any) => {
                constants.IS_DEBUG && console.log("LOGIN FAIL: ", e);
                setSubmitting(false);
              });
          }}
        >
          {({ isSubmitting, handleSubmit }) => (
            <Form className="glass-panel w-full p-5 sm:p-8">
              <button
                type="button"
                onClick={handleBack}
                className="mb-3 flex items-center gap-1.5 border-none bg-transparent p-0 font-body text-sm text-white/50 transition-colors hover:text-neon-cyan cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <TipBot speech={speechMarkup()} />
              <div className="mt-4">
                <h1 className="mb-2 text-center font-pressstart text-sm text-neon-cyan">
                  Signup
                </h1>
                <p className="mb-6 text-center font-body text-sm text-white/50">
                  {parse(description)}
                </p>

                <div className="space-y-4">
                  <div>
                    <Field
                      name="email"
                      id="email"
                      component={FormikInput}
                      label="Email"
                    />
                  </div>

                  <div>
                    <Field
                      name="password"
                      id="password"
                      component={FormikPassword}
                      label="Password"
                    />
                  </div>

                  <div>
                    <Field
                      name="passwordConfirm"
                      id="passwordConfirm"
                      component={FormikPassword}
                      label="Re-type Password"
                    />
                  </div>
                </div>

                {/* Terms */}
                <div className="mt-6 rounded-lg border border-glass-border bg-white/[0.03] p-4">
                  <Carousel
                    showArrows={false}
                    showStatus={false}
                    showThumbs={false}
                    selectedItem={currentSlide}
                    onChange={setCurrentSlide}
                  >
                    <div className="flex items-start gap-3 text-left">
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
                      <span
                        className={`font-body text-sm ${
                          privacyTerms ? "text-white" : "text-white/50"
                        }`}
                      >
                        I have received and read the{" "}
                        <button
                          type="button"
                          onClick={togglePrivacyModal}
                          className="cursor-pointer border-none bg-transparent p-0 font-semibold text-neon-cyan underline"
                        >
                          Privacy Policy
                        </button>
                        .
                      </span>
                    </div>
                    <div className="flex items-start gap-3 text-left">
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
                      <span
                        className={`font-body text-sm ${
                          reportingTerms ? "text-white" : "text-white/50"
                        }`}
                      >
                        By clicking &quot;Signup&quot; I agree to the{" "}
                        <button
                          type="button"
                          onClick={toggleSignatureModal}
                          className="cursor-pointer border-none bg-transparent p-0 font-semibold text-neon-cyan underline"
                        >
                          Terms &amp; Conditions
                        </button>
                      </span>
                    </div>
                  </Carousel>
                </div>
              </div>

              {/* Submit */}
              <div className="mt-6 flex justify-center">
                <button
                  type="submit"
                  disabled={!(privacyTerms && reportingTerms)}
                  className="neon-btn w-full max-w-xs"
                >
                  Submit
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      {/* Modals */}
      {openSignatureModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={toggleSignatureModal}
        >
          <div
            className="glass-panel max-h-[80vh] w-full max-w-2xl overflow-y-auto bg-surface-deep p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <ElectronicSignaturesModal />
            <button
              onClick={toggleSignatureModal}
              className="neon-btn mt-4 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {openPrivacyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={togglePrivacyModal}
        >
          <div
            className="glass-panel max-h-[80vh] w-full max-w-2xl overflow-y-auto bg-surface-deep p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <FinancialPrivacyModal />
            <button
              onClick={togglePrivacyModal}
              className="neon-btn mt-4 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
