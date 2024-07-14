import React from "react";
import { TextField } from "@material-ui/core";

import { Error } from "./FormikInput.styles";

export const FormikDateOfBirth = ({
  field: { ...fields },
  form: { touched, errors },
  ...props
}: any) => (
  <>
    <TextField
      id="dateOfBirth"
      variant="outlined"
      selectedTheme="dark"
      {...props}
      {...fields}
      invalid={Boolean(touched[fields.name] && errors[fields.name]).toString()}
    />
    {touched[fields.name] && errors[fields.name] ? (
      <Error>{errors[fields.name]}</Error>
    ) : (
      ""
    )}
  </>
);
