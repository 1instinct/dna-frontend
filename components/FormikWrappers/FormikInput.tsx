import React from "react";
import { Field } from "formik";
// import { TextField } from "@material-ui/core";
// import { Field, useFormikContext } from 'formik';

import { BasicField, Error } from "./FormikInput.styles";

export const FormikInput = ({
  field: { ...fields },
  form: { touched, errors },
  styles,
  ...props
}: any) => {
  return (
    <>
      <BasicField
        // selectedTheme="dark"
        {...props}
        {...fields}
        styles={errors.length > 0 && { border: "solid 1px red" }}
        invalid={Boolean(touched[fields.name] && errors[fields.name])}
        // variant="outlined"
      />
      {touched[fields.name] && errors[fields.name] ? (
        <Error>{errors[fields.name]}</Error>
      ) : (
        ""
      )}
    </>
  );
};
