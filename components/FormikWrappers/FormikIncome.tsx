import React from "react";
import { TextField } from "@material-ui/core";

import { Error } from "./FormikInput.styles";

export const FormikIncome = ({
  field,
  field: { ...fields },
  form: { touched, errors, name },
  ...props
}: any) => (
  <>
    {/* <Input id="income" variant="income" input="number" selectedTheme="dark" {...props} {...fields} invalid={Boolean(touched[fields.name] && errors[fields.name])} /> */}
    <TextField
      id="income"
      variant="outlined"
      input="number"
      selectedTheme="dark"
      {...props}
      {...fields}
      invalid={touched[fields.name] && errors[fields.name] ? 1 : 0}
    />
    {touched[fields.name] && errors[fields.name] ? (
      <Error>{errors[fields.name]}</Error>
    ) : (
      ""
    )}
  </>
);
