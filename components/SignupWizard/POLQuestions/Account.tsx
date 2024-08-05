// Vendor
import React, { useState, useCallback, createRef } from "react";
import { Carousel } from "react-responsive-carousel";
import { Field, useFormikContext } from "formik";
import parse from "html-react-parser";
import { Modal } from "@material-ui/core";

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
import { PolElectronicSignaturesModal } from "../../POLTerms/ElectronicSignaturesModal";
import { PolFinancialPrivacyModal } from "../../POLTerms/FinancialPrivacyModal";

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

  const toggleSignatureModal = () => {
    setOpenSignatureModal(!openSignatureModal);
  };

  const togglePrivacyModal = () => {
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
              <TermsStatement accepted={signatureTerms}>
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
              <TermsStatement accepted={privacyTerms}>
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
              <TermsStatement accepted={signatureTerms}>
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
              <TermsStatement accepted={authorizeTerms}>
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
              <TermsStatement accepted={Terms}>
                Consumer Report: By clicking &quot;GET TERMS&quot;, I give {process.env.NEXT_PUBLIC_SITE_TITLE} written consent to obtain consumer reports from one or more consumer reporting agencies to show me credit options I prequalify for when financing with {process.env.NEXT_PUBLIC_SITE_TITLE}. Retrieving my pre-qualification credit terms generates a soft credit inquiry, which is visible only to me and does not affect my credit score.
              </TermsStatement>
            </Term> */}
          </Carousel>

          <Modal
            // aria-labelledby="modal-title"
            // aria-describedby="modal-description"
            onClose={toggleSignatureModal}
            open={openSignatureModal}
          >
            <StyledModalContent>
              {/* <PolElectronicSignaturesModal handleClose={() => setOpenSignatureModal(!openSignatureModal)} /> */}
              <PolElectronicSignaturesModal />
              {/* <button
                onClick={togglePrivacyModal}
                role="button"
                onKeyDown={togglePrivacyModal}
                tabIndex={0}
              >Signature</button> */}
            </StyledModalContent>
          </Modal>

          <Modal
            // aria-labelledby="modal-title"
            // aria-describedby="modal-description"
            onClose={togglePrivacyModal}
            open={openPrivacyModal}
          >
            <StyledModalContent>
              <PolFinancialPrivacyModal />
              {/* <button
                onClick={togglePrivacyModal}
                role="button"
                onKeyDown={togglePrivacyModal}
                tabIndex={0}
              >Close</button> */}
            </StyledModalContent>
          </Modal>
        </TermsWrapper>
      </InputGroupWrapper>
    </QuestionWrapper>
  );
};
