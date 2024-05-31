// Vendor
import React, { useCallback } from "react";
import { Field } from "formik";
import { Button } from "@material-ui/core";

// Local
import TipBot from "../../TipBot";
import { FormikInput } from "../../FormikWrappers";
import { QuestionWrapper, InputGroupWrapper, InputWrapper } from "./Questions.styles";

export const CompanyDetails = () => {
  // const { errors, touched } = useFormikContext()

  const speechMarkup = useCallback(() => {
    return { __html: "Can you tell a bit about your company?" };
  }, []);

  return (
    <QuestionWrapper>
      <TipBot speech={speechMarkup()} />
      <InputGroupWrapper>
        <InputWrapper>
          <Field
            name="companyName"
            id="companyName"
            component={FormikInput}
            label="Company Name"
            required
          />
        </InputWrapper>
        <InputWrapper>
          <Field
            name="permitNumber"
            id="permitNumber"
            component={FormikInput}
            label="Reseller's Permit Number"
            required
          />
        </InputWrapper>
      </InputGroupWrapper>
    </QuestionWrapper>
  );
};
