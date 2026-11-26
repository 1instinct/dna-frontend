import React, { useState } from "react";
import { Field } from "formik";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@lib/utils";
import { fieldA11y, FieldLabel, FieldError } from "./fieldA11y";

const inputClass =
  "w-full rounded-lg border-2 border-dashed border-border bg-background px-3 py-2.5 pr-10 font-body text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand";

/**
 * A Formik password input with a show/hide toggle. `label`, `showLabel` and
 * `id` work as in FormikInput.
 */
export const FormikPassword = ({
  field: { ...fields },
  form: { touched, errors },
  styles,
  label,
  showLabel,
  labelClassName,
  id,
  ...props
}: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const a11y = fieldA11y({
    name: fields.name,
    id,
    touched,
    errors,
    describedBy: props["aria-describedby"]
  });

  const togglePasswordVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <>
      <FieldLabel
        htmlFor={a11y.inputId}
        visible={showLabel}
        className={labelClassName}
      >
        {label}
      </FieldLabel>
      <div className="relative w-full">
        <Field
          {...props}
          {...fields}
          {...a11y.inputProps}
          type={showPassword ? "text" : "password"}
          placeholder={label}
          className={cn(inputClass, a11y.isInvalid && "border-destructive")}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-controls={a11y.inputId}
          className="absolute right-2.5 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded border-none bg-transparent p-1 text-muted-foreground opacity-60 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Eye className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>
      <FieldError id={a11y.errorId}>{a11y.error}</FieldError>
    </>
  );
};
