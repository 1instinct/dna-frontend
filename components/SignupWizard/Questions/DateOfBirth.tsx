// Vendor
import React, { useCallback } from "react";
// import NumberFormat from 'react-number-format';
import { Field, useFormikContext } from "formik";

// Local
import TipBot from "../../TipBot";
import { FormikDateOfBirth } from "../../FormikWrappers";
import {
  QuestionWrapper,
  InputGroupWrapper,
  InputWrapper
} from "./Questions.styles";

export const DateOfBirth = () => {
  // const { errors, touched } = useFormikContext();

  const speechMarkup = useCallback(() => {
    return { __html: "When is your birthday 🎉?" };
  }, []);

  return (
    <QuestionWrapper>
      <TipBot speech={speechMarkup()} />
      <InputGroupWrapper></InputGroupWrapper>
    </QuestionWrapper>
  );
};
