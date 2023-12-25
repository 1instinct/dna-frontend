import React from "react";
import { TextField } from "@material-ui/core";

import { BasicField, Error } from "./FormikInput.styles";

export const FormikDateOfBirth = ({
  field: { ...fields },
  form: { touched, errors },
  ...props
}: any) => (
  <>
    {touched[fields.name] && errors[fields.name] ? (
      <Error>{errors[fields.name]}</Error>
    ) : (
      ""
    )}
    <TextField
      id="dateOfBirth"
      variant="outlined"
      selectedTheme="dark"
      placeholder="MM/DD/YYYY"
      {...props}
      {...fields}
      invalid={Boolean(touched[fields.name] && errors[fields.name]).toString()}
    />
  </>
);
