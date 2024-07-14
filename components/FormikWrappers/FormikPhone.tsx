import React from "react";
import InputMask from "react-input-mask";
import { TextField } from "@material-ui/core";
// import { Field, useFormikContext } from 'formik';

import { Error } from "./FormikInput.styles";

export const FormikPhone = ({
  field: { ...fields },
  form: { touched, errors },
  styles,
  ...props
}: any) => (
  <>
    {/* <Input id="phoneNumber" variant="phoneNumber" selectedTheme="dark" {...props} {...fields} invalid={Boolean(touched[fields.name] && errors[fields.name])}/> */}
    <InputMask
      mask="+1 999 999 9999"
      maskChar=" "
      id="phoneNumber"
      selectedTheme="dark"
      {...props}
      {...fields}
      invalid={touched[fields.name] && errors[fields.name] ? 1 : 0}
    >
      {(inputProps: any) => <TextField variant="outlined" {...props} />}
    </InputMask>
    {touched[fields.name] && errors[fields.name] ? (
      <Error>{errors[fields.name]}</Error>
    ) : (
      ""
    )}
  </>
);
