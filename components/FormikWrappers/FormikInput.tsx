import React from "react";
import { Field } from "formik";
import { cn } from "@lib/utils";
import { fieldA11y, FieldLabel, FieldError } from "./fieldA11y";

const inputClass =
  "w-full rounded-lg border-2 border-dashed border-border bg-background px-3 py-2.5 font-body text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand";

/**
 * A Formik text input. `label` names the input (a screen-reader-only label,
 * or a visible one with `showLabel`) and is also its placeholder; `id`
 * defaults to the field name.
 */
export const FormikInput = ({
  field: { ...fields },
  form: { touched, errors },
  styles,
  label,
  showLabel,
  labelClassName,
  id,
  ...props
}: any) => {
  const a11y = fieldA11y({
    name: fields.name,
    id,
    touched,
    errors,
    describedBy: props["aria-describedby"]
  });

  return (
    <>
      <FieldLabel
        htmlFor={a11y.inputId}
        visible={showLabel}
        className={labelClassName}
      >
        {label}
      </FieldLabel>
      <Field
        {...props}
        {...fields}
        {...a11y.inputProps}
        placeholder={label}
        className={cn(inputClass, a11y.isInvalid && "border-destructive")}
      />
      <FieldError id={a11y.errorId}>{a11y.error}</FieldError>
    </>
  );
};
