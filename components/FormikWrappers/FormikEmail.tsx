import React from "react";

import { Error } from "./FormikInput.styles";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-4 py-3 font-body text-sm text-foreground transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

const FormikInput = ({
  field: { ...fields },
  form: { touched, errors },
  styles,
  ...props
}: any) => (
  <>
    <input
      id="email"
      type="email"
      className={`${inputClass}${
        touched[fields.name] && errors[fields.name] ? " border-destructive" : ""
      }`}
      {...props}
      {...fields}
    />
    {touched[fields.name] && errors[fields.name] ? (
      <Error>{errors[fields.name]}</Error>
    ) : (
      ""
    )}
  </>
);
export default FormikInput;
