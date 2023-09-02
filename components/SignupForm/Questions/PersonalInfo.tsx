// Vendor
import React, { useCallback } from "react";
import { Field } from "formik";
import { Button } from "@material-ui/core";

// Local
import TipBot from "../../TipBot";
import { FormikInput } from "../../FormikWrappers";
import {
  QuestionWrapper,
  InputGroupWrapper,
  InputWrapper,
  Title,
  Subtitle,
  LinkOut
} from "./Questions.styles";

export const PersonalInfo = () => {
  // const { errors, touched } = useFormikContext()

  const speechMarkup = useCallback(() => {
    return { __html: "Let's start with your name." };
  }, []);

  return (
    <QuestionWrapper>
      <TipBot speech={speechMarkup()} />
      <InputGroupWrapper>
        <InputWrapper>
          <Field
            name="firstName"
            id="firstName"
            component={FormikInput}
            label="First Name"
          />
        </InputWrapper>
        {/* <InputWrapper>
          <Field
            name="middleName"
            id="middleName"
            component={FormikInput}
            label="Middle Name (if on license)"
          />
        </InputWrapper> */}
        <InputWrapper>
          <Field
            name="lastName"
            id="lastName"
            component={FormikInput}
            label="Last Name"
          />
        </InputWrapper>
        {/* <InputWrapper>
          <Field
            name="suffix"
            id="suffix"
            component={FormikInput}
            label="Suffix (if on license.. Sr, Jr)"
          />
        </InputWrapper> */}
      </InputGroupWrapper>
    </QuestionWrapper>
  );
};
