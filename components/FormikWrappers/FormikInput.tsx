import React from "react";
import { Field } from "formik";
import { cn } from "@lib/utils";

const inputClass =
  "w-full rounded-lg border-2 border-dashed border-border bg-background px-3 py-2.5 font-body text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand";

const errorClass =
  "mt-1 text-left font-body text-xs font-bold text-destructive";

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
        className={cn(inputClass, isInvalid && "border-destructive")}
      />
      {touched[fields.name] && errors[fields.name] ? (
        <div className={errorClass}>{errors[fields.name]}</div>
      ) : null}
    </>
  );
};
