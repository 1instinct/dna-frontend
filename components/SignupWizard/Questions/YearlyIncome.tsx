// Vendor
import React, { useState, useCallback } from "react";
import { Field, useFormikContext } from "formik";
import { InputAdornment } from "@material-ui/core";

// Local
import TipBot from "../../TipBot";
import { FormikIncome } from "../../FormikWrappers";
import {
  QuestionWrapper,
  InputGroupWrapper,
  InputWrapper
} from "./Questions.styles";

export const YearlyIncome = () => {
  const speechMarkup = useCallback(() => {
    return { __html: "How much do you make each year?" };
  }, []);

  return (
    <QuestionWrapper>
      <TipBot speech={speechMarkup()} />
      <InputGroupWrapper>
        <InputWrapper>
          <Field
            name="yearlyIncome"
            id="yearlyIncome"
            component={FormikIncome}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              )
            }}
            label="Yearly Income"
          />
        </InputWrapper>
      </InputGroupWrapper>
    </QuestionWrapper>
  );
};
