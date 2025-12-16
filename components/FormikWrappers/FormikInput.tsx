import React from "react";

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
        {...props}
        {...fields}
        placeholder={props.label}
        styles={errors.length > 0 && { border: "solid 1px red" }}
        invalid={Boolean(touched[fields.name] && errors[fields.name])}
      />
      {touched[fields.name] && errors[fields.name] ? (
        <Error>{errors[fields.name]}</Error>
      ) : (
        ""
      )}
    </>
  );
};
