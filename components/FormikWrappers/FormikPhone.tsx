import React from "react";
import InputMask from "react-input-mask";

import { BasicField, Error } from "./FormikInput.styles";

export const FormikPhone = ({
  field: { ...fields },
  form: { touched, errors },
  styles,
  ...props
}: any) => (
  <>
    <InputMask
      mask="(999) 999-9999"
      maskChar="_"
      {...fields}
      invalid={touched[fields.name] && errors[fields.name] ? 1 : 0}
    >
      {(inputProps: any) => (
        <BasicField
          {...inputProps}
          placeholder={props.label || "Phone Number"}
          invalid={touched[fields.name] && errors[fields.name] ? 1 : 0}
        />
      )}
    </InputMask>
    {touched[fields.name] && errors[fields.name] ? (
      <Error>{errors[fields.name]}</Error>
    ) : null}
  </>
);
