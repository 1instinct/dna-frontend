// Vendor
import React, { useState, useCallback } from "react";
// import NumberFormat from 'react-number-format';
import { Field, useFormikContext } from "formik";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng
} from "react-places-autocomplete";

// Local
import TipBot from "../../TipBot";
import { FormikInput, FormikAutocomplete } from "../../FormikWrappers";
import {
  QuestionWrapper,
  InputGroupWrapper,
  InputWrapper
} from "./Questions.styles";

// const suggestions = [
//   '100 Freeman Street Brooklyn NY 11222',
//   '100 Freeman Road Birmingham KY 19278'
// ];

export const CompanyAddress = () => {
  // const [address, setAddress] = useState('');

  // const { errors, touched } = useFormikContext();

  const speechMarkup = useCallback(() => {
    return { __html: "What is your address?" };
  }, []);

  return (
    <QuestionWrapper>
      <TipBot speech={speechMarkup()} />
      <InputGroupWrapper>
        <InputWrapper>
          <Field
            name="companyAddress"
            id="companyAddress"
            component={FormikAutocomplete}
            label="Company Address"
            addressType="Company"
          />
        </InputWrapper>
        <InputWrapper>
          <Field
            name="unitNumber"
            id="unitNumber"
            component={FormikInput}
            label="Suite / Floor / Unit"
          />
        </InputWrapper>
      </InputGroupWrapper>
    </QuestionWrapper>
  );
};
