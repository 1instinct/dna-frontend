import React from "react";

import { fieldA11y, FieldLabel, FieldError } from "./fieldA11y";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-4 py-3 font-body text-sm text-foreground transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

const FormikInput = ({
  field: { ...fields },
  form: { touched, errors },
  styles,
  label,
  id,
  ...props
}: any) => {
  const a11y = fieldA11y({
    name: fields.name,
    id: id || "email",
    touched,
    errors
  });

  return (
    <>
      <FieldLabel htmlFor={a11y.inputId}>{label || "Email"}</FieldLabel>
      <input
        type="email"
        autoComplete="email"
        className={`${inputClass}${
          a11y.isInvalid ? " border-destructive" : ""
        }`}
        {...props}
        {...fields}
        {...a11y.inputProps}
      />
      <FieldError id={a11y.errorId}>{a11y.error}</FieldError>
    </>
  );
};
export default FormikInput;
