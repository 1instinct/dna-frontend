import React from "react";

import { BasicField } from "./FormikInput.styles";
import InputMask from "react-input-mask";
import { fieldA11y, FieldLabel, FieldError } from "./fieldA11y";

export const FormikDateOfBirth = ({
  field: { ...fields },
  form: { touched, errors },
  ...props
}: any) => {
  const a11y = fieldA11y({
    name: fields.name,
    id: props.id || "dateOfBirth",
    touched,
    errors
  });

  return (
    <>
      <FieldLabel htmlFor={a11y.inputId}>{props.label}</FieldLabel>
      <InputMask
        id="dateOfBirth"
        mask="99/99/9999"
        maskChar=" "
        width={"100%"}
        {...props}
        {...fields}
        invalid={a11y.isInvalid.toString()}
      >
        {(inputProps: any) => (
          <BasicField
            placeholder={props.label}
            autoComplete="bday"
            {...props}
            {...a11y.inputProps}
          />
        )}
      </InputMask>
      <FieldError id={a11y.errorId}>{a11y.error}</FieldError>
    </>
  );
};
