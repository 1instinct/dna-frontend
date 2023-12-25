import React from "react";
import { TextField } from "@material-ui/core";
// import { Field, useFormikContext } from 'formik';

import { BasicField, Error } from "./FormikInput.styles";

const FormikInput = ({
  field: { ...fields },
  form: { touched, errors },
  styles,
  ...props
}: any) => (
  <>
    {touched[fields.name] && errors[fields.name] ? (
      <Error>{errors[fields.name]}</Error>
    ) : (
      ""
    )}
    <BasicField
      id="email"
      variant="email"
      {...props}
      {...fields}
      invalid={Boolean(touched[fields.name] && errors[fields.name])}
    />
  </>
);
export default FormikInput;
