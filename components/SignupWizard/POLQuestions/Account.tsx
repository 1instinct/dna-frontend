// Vendor
import React, { useState, useCallback, createRef, useRef } from "react";
import { Carousel } from "react-responsive-carousel";
import { Field, useFormikContext } from "formik";
import parse from "html-react-parser";
import { Dialog, DialogContent, DialogTitle } from "@components/ui";
// Local
import TipBot from "../../TipBot";
import Static from "../../../utilities/staticData";
import { FormikInput, FormikPhone, FormikCheckbox } from "../../FormikWrappers";
import {
  Title,
  Subtitle,
  Description,
  QuestionWrapper,
  InputGroupWrapper,
  InputWrapper,
  TermsWrapper,
  TermsStatement,
  Term,
  StyledModalContent
} from "./Questions.styles";
import { ElectronicSignaturesModal } from "../../Legal/ElectronicSignaturesModal";
import { FinancialPrivacyModal } from "../../Legal/FinancialPrivacyModal";

export const Account = () => {
  // const { values, form, submitForm } = useFormikContext();
  // console.log("FORM: ", values, useFormikContext);
  // const { errors, touched } = useFormikContext();

  const [openSignatureModal, setOpenSignatureModal] = useState(false);
  const [openPrivacyModal, setOpenPrivacyModal] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);

  const [signatureTerms, setSignatureCheckbox] = useState(false);
  const [privacyTerms, setPrivacyCheckbox] = useState(false);
  // const [reportingTerms, setReportingCheckbox] = useState(false);
  // const [authorizeTerms, setAuthorizeCheckbox] = useState(false);

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

  // const updateCurrentSlide = index => {
  //   if (currentSlide !== index) {
  //     setCurrentSlide(index);
  //   }
  // };

  const nextSlide = () => {
    setCurrentSlide(currentSlide + 1);
  };

  const handleSignatureCheckbox = (field: any) => {
    setSignatureCheckbox(!signatureTerms);
    // form.setFieldValue('acceptSignatureTerms', signatureTerms, false);
  };

  const handlePrivacyCheckbox = (field: any) => {
    setPrivacyCheckbox(!privacyTerms);
    // form.setFieldValue(field.name, privacyTerms, false);
  };

  const speechMarkup = useCallback(() => {
    return { __html: Static.questions.account.sebastian };
  }, []);

  const { title, subtitle, description } = Static.questions.account;

  const passwordRef = createRef();

  return (
    <QuestionWrapper>
      {/* <TipBot speech={speechMarkup()} /> */}
      <InputGroupWrapper>
        <Title>{parse(title)}</Title>
        {/* <Subtitle>{parse(subtitle)}</Subtitle> */}
        <Description>{parse(description)}</Description>
        <InputWrapper>
          <Field
            name="phoneNumber"
            id="phoneNumber"
            component={FormikPhone}
            label="Phone"
            aria-required="true"
          />
        </InputWrapper>

        <InputWrapper>
          <Field
            name="password"
            id="password"
            variant="password"
            component={FormikInput}
            label="Password"
            ref={passwordRef}
            type="password"
            autoComplete="new-password"
            aria-required="true"
          />
        </InputWrapper>

        <InputWrapper>
          <Field
            name="passwordConfirm"
            id="passwordConfirm"
            variant="password"
            component={FormikInput}
            label="Re-type Password"
            ref={passwordRef}
            type="password"
            autoComplete="new-password"
            aria-required="true"
          />
        </InputWrapper>

        <TermsWrapper>
          {/* https://jasonwatmore.com/post/2020/02/08/react-formik-required-checkbox-example */}
          <Carousel
            showArrows={false}
            // renderIndicator={false}
            showStatus={false}
            showThumbs={false}
            selectedItem={currentSlide}
            onChange={setCurrentSlide}
          >
            {/* <Term>
              <Field type="checkbox" name="acceptSignatureTerms">
                {(formikProps: any) => (
                  <FormikCheckbox
                    {...formikProps}
                    nextTerm={nextSlide}
                    accepted={signatureTerms}
                    handleTermCheckbox={handleSignatureCheckbox}
                  />
                )}
              </Field>
              <TermsStatement htmlFor="acceptSignatureTerms" accepted={signatureTerms}>
                I have read and agree to the{" "}
                <button type="button" onClick={toggleSignatureModal}>
                  E-SIGN Consent
                </button>{" "}
                that enables all transactions and disclosure delivery to occur electronically.
              </TermsStatement>
            </Term> */}
            <Term>
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
              <TermsStatement
                htmlFor="acceptPrivacyTerms"
                accepted={privacyTerms}
              >
                I have received and read the&nbsp;
                <button type="button" onClick={togglePrivacyModal}>
                  Privacy Policy
                </button>
                .
              </TermsStatement>
            </Term>
            <Term>
              <Field type="checkbox" name="acceptSignatureTerms">
                {(formikProps: any) => (
                  <FormikCheckbox
                    {...formikProps}
                    nextTerm={nextSlide}
                    accepted={signatureTerms}
                    handleTermCheckbox={handleSignatureCheckbox}
                  />
                )}
              </Field>
              <TermsStatement
                htmlFor="acceptSignatureTerms"
                accepted={signatureTerms}
              >
                By clicking &quot;Signup&quot; I agree to the&nbsp;
                <button type="button" onClick={toggleSignatureModal}>
                  Terms &amp; Conditions
                </button>
              </TermsStatement>
            </Term>
            {/* <Term>
              <Field type="checkbox" name="acceptAuthorizeTerms">
                {(formikProps: any) => (
                  <FormikCheckbox
                    {...formikProps}
                    nextTerm={nextSlide}
                    accepted={authorizeTerms}
                    handleTermCheckbox={handleAuthorizeCheckbox}
                  />
                )}
              </Field>
              <TermsStatement htmlFor="acceptAuthorizeTerms" accepted={authorizeTerms}>
                That by providing my phone number, {process.env.NEXT_PUBLIC_SITE_TITLE}, or{" "}
                {process.env.NEXT_PUBLIC_SITE_TITLE}&apos;s authorized representatives*, may call and/or send
                text messages (including by using equipment to automatically dial telephone numbers)
                about my interest in a purchase, for marketing/sales purposes, or for any other
                servicing or informational purpose related to my account. You do not have to consent
                to receiving calls or texts to purchase from {process.env.NEXT_PUBLIC_SITE_TITLE}.
                <br />
                <strong>
                  *Including, but not limited to, Bridgecrest Credit Company, GO Financial and
                  SilverRock Automotive.
                </strong>
              </TermsStatement>
            </Term> */}
            {/* Below term appears below current Softpull form submit buttons */}
            {/* <Term>
              <Field type="checkbox" name="acceptConstentTerms" component={FormikCheckbox} className={'form-check-input ' + (errors.acceptTerms && touched.acceptTerms ? ' is-invalid' : '')} />
              <TermsStatement htmlFor="acceptConstentTerms" accepted={Terms}>
                Consumer Report: By clicking &quot;GET TERMS&quot;, I give {process.env.NEXT_PUBLIC_SITE_TITLE} written consent to obtain consumer reports from one or more consumer reporting agencies to show me credit options I prequalify for when financing with {process.env.NEXT_PUBLIC_SITE_TITLE}. Retrieving my pre-qualification credit terms generates a soft credit inquiry, which is visible only to me and does not affect my credit score.
              </TermsStatement>
            </Term> */}
          </Carousel>

          <Dialog
            open={openSignatureModal}
            onOpenChange={setOpenSignatureModal}
          >
            <DialogContent
              aria-describedby={undefined}
              onCloseAutoFocus={restoreFocus}
              className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-lg p-6"
            >
              <DialogTitle className="sr-only">
                Terms &amp; Conditions
              </DialogTitle>
              <ElectronicSignaturesModal />
            </DialogContent>
          </Dialog>

          <Dialog open={openPrivacyModal} onOpenChange={setOpenPrivacyModal}>
            <DialogContent
              aria-describedby={undefined}
              onCloseAutoFocus={restoreFocus}
              className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-lg p-6"
            >
              <DialogTitle className="sr-only">Privacy Policy</DialogTitle>
              <FinancialPrivacyModal />
            </DialogContent>
          </Dialog>
        </TermsWrapper>
      </InputGroupWrapper>
    </QuestionWrapper>
  );
};
