import React, { useState, useCallback } from "react";
import { Field } from "formik";
import parse from "html-react-parser";

import TipBot from "../../TipBot";
import Static from "../../../utilities/staticData";
import {
  FormikInput,
  FormikPassword,
  FormikCheckbox
} from "../../FormikWrappers";
import {
  Title,
  Subtitle,
  Description,
  QuestionWrapper,
  InputGroupWrapper,
  InputWrapper,
  TermsWrapper,
  TermsStatement,
  Term
} from "./Questions.styles";
import { ElectronicSignaturesModal } from "../../Terms/ElectronicSignaturesModal";
import { FinancialPrivacyModal } from "../../Terms/FinancialPrivacyModal";

export const Account = () => {
  const [openSignatureModal, setOpenSignatureModal] = useState(false);
  const [openPrivacyModal, setOpenPrivacyModal] = useState(false);
  const [privacyTerms, setPrivacyCheckbox] = useState(false);
  const [reportingTerms, setReportingCheckbox] = useState(false);

  const toggleSignatureModal = () =>
    setOpenSignatureModal(!openSignatureModal);
  const togglePrivacyModal = () => setOpenPrivacyModal(!openPrivacyModal);

  const handlePrivacyCheckbox = () => setPrivacyCheckbox(!privacyTerms);
  const handleReportingCheckbox = () =>
    setReportingCheckbox(!reportingTerms);

  const speechMarkup = useCallback(() => {
    return {
      __html: "Great! You're so close. Just need a super secure password."
    };
  }, []);

  const { title, subtitle, description } = Static.questions.account;

  return (
    <QuestionWrapper>
      <TipBot speech={speechMarkup()} />
      <InputGroupWrapper>
        <Title>{parse(title)}</Title>
        <Subtitle>{parse(subtitle)}</Subtitle>
        <Description>{parse(description)}</Description>

        <InputWrapper>
          <Field
            name="email"
            id="email"
            component={FormikInput}
            label="Email"
          />
        </InputWrapper>

        <InputWrapper>
          <Field
            name="password"
            id="password"
            component={FormikPassword}
            label="Password"
          />
        </InputWrapper>

        <InputWrapper>
          <Field
            name="passwordConfirm"
            id="passwordConfirm"
            component={FormikPassword}
            label="Re-type Password"
          />
        </InputWrapper>

        <TermsWrapper>
          <Term>
            <Field type="checkbox" name="acceptPrivacyTerms">
              {(formikProps: any) => (
                <FormikCheckbox
                  {...formikProps}
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
            <Field type="checkbox" name="acceptReportingTerms">
              {(formikProps: any) => (
                <FormikCheckbox
                  {...formikProps}
                  accepted={reportingTerms}
                  handleTermCheckbox={handleReportingCheckbox}
                />
              )}
            </Field>
            <TermsStatement accepted={reportingTerms}>
              By clicking &quot;Sign Up&quot; I agree to the&nbsp;
              <button type="button" onClick={toggleSignatureModal}>
                Terms &amp; Conditions
              </button>
            </TermsStatement>
          </Term>

          {openSignatureModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
              onClick={toggleSignatureModal}
              onKeyDown={(e) =>
                e.key === "Escape" && toggleSignatureModal()
              }
              role="dialog"
              aria-modal="true"
            >
              <div
                className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-background p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <ElectronicSignaturesModal />
              </div>
            </div>
          )}

          {openPrivacyModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
              onClick={togglePrivacyModal}
              onKeyDown={(e) =>
                e.key === "Escape" && togglePrivacyModal()
              }
              role="dialog"
              aria-modal="true"
            >
              <div
                className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-background p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <FinancialPrivacyModal />
              </div>
            </div>
          )}
        </TermsWrapper>
      </InputGroupWrapper>
    </QuestionWrapper>
  );
};
