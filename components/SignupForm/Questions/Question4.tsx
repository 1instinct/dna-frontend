// Vendor
import React, { useState, useCallback } from "react";
import { Field, useFormikContext } from "formik";

// Local
import Sebastian from "../Sebastian";
import { FormikIncome } from "../FormikWrappers";
import { QuestionWrapper, InputGroupWrapper, InputWrapper } from "./Questions.styles";

const Question4 = () => {
  const speechMarkup = useCallback(() => {
    return { __html: "How much do you make each year?" };
  });

  return (
    <QuestionWrapper>
      <Sebastian speech={speechMarkup()} />
      <InputGroupWrapper>
        <InputWrapper>
          <Field
            name="yearlyIncome"
            id="yearlyIncome"
            component={FormikIncome}
            label="Yearly Income"
          />
        </InputWrapper>
      </InputGroupWrapper>
    </QuestionWrapper>
  );
};

export default Question4;
