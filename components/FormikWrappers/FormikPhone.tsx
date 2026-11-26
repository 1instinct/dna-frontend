import React from "react";
import InputMask from "react-input-mask";

import { BasicField } from "./FormikInput.styles";
import { fieldA11y, FieldLabel, FieldError } from "./fieldA11y";

export const FormikPhone = ({
  field: { ...fields },
  form: { touched, errors },
  styles,
  label,
  showLabel,
  labelClassName,
  id,
  ...props
}: any) => {
  const a11y = fieldA11y({ name: fields.name, id, touched, errors });
  const labelText = label || "Phone Number";

  return (
    <>
      <FieldLabel
        htmlFor={a11y.inputId}
        visible={showLabel}
        className={labelClassName}
      >
        {labelText}
      </FieldLabel>
      {/* Props other than the controlled ones reach the input through the
          children function's inputProps. */}
      <InputMask
        mask="(999) 999-9999"
        maskChar="_"
        type="tel"
        autoComplete="tel"
        {...props}
        {...fields}
        {...a11y.inputProps}
        invalid={a11y.isInvalid ? 1 : 0}
      >
        {(inputProps: any) => (
          <BasicField {...inputProps} placeholder={labelText} />
        )}
      </InputMask>
      <FieldError id={a11y.errorId}>{a11y.error}</FieldError>
    </>
  );
};
