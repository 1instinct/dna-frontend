import React from "react";
import { Field } from "formik";
import { cn } from "@lib/utils";

const inputClass =
  "neon-focus w-full rounded-lg border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm px-3 py-3 font-body text-sm text-white outline-none transition-all duration-300 placeholder:text-white/30 shadow-[inset_0_1px_3px_rgba(0,0,0,0.3),inset_0_-1px_0_rgba(255,255,255,0.04)] hover:border-white/[0.15] hover:bg-white/[0.06]";

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
