import React from "react";

import { Error } from "./FormikInput.styles";

const inputClass =
  "w-full rounded-lg border border-glass-border bg-surface-deep px-4 py-3 font-body text-sm text-white transition-colors focus:border-neon-cyan focus:outline-none focus:ring-2 focus:ring-neon-cyan/20";

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
