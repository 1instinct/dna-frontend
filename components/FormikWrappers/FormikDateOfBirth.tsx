import React from "react";
import { TextField } from "@material-ui/core";

import { BasicField, Error } from "./FormikInput.styles";
import InputMask from "react-input-mask";

export const FormikDateOfBirth = ({
  field: { ...fields },
  form: { touched, errors },
  ...props
}: any) => (
  <>
    <InputMask
      id="dateOfBirth"
      mask="99/99/9999"
      maskChar=" "
      width={"100%"}
      // variant="outlined"
      // selectedTheme="dark"
      {...props}
      {...fields}
      invalid={Boolean(touched[fields.name] && errors[fields.name]).toString()}
    >
      {(inputProps: any) => (
        <BasicField variant="outlined" placeholder={props.label} {...props} />
      )}
    </InputMask>
    {touched[fields.name] && errors[fields.name] ? (
      <Error>{errors[fields.name]}</Error>
    ) : (
      ""
    )}
  </>
);
