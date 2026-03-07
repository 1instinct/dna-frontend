import React from "react";
import { Field } from "formik";
import { cn } from "@lib/utils";

const inputClass =
  "neon-focus w-full rounded-lg border border-glass-border bg-surface-deep px-3 py-3 font-body text-sm text-white outline-none transition-colors placeholder:text-white/30";

const errorClass = "mt-1 text-left font-body text-xs font-bold text-neon-pink";

export const FormikInput = ({
  field: { ...fields },
  form: { touched, errors },
  styles,
  ...props
}: any) => {
  const isInvalid = Boolean(touched[fields.name] && errors[fields.name]);

  return (
    <>
      <Field
        {...props}
        {...fields}
        placeholder={props.label}
        className={cn(inputClass, isInvalid && "border-neon-pink")}
      />
      {touched[fields.name] && errors[fields.name] ? (
        <div className={errorClass}>{errors[fields.name]}</div>
      ) : null}
    </>
  );
};
