import React from "react";
import { getIn } from "formik";
import { cn } from "@lib/utils";

const errorClass =
  "mt-1 text-left font-body text-xs font-bold text-destructive";

interface FieldA11yArgs {
  name: string;
  id?: string;
  touched: unknown;
  errors: unknown;
  describedBy?: string;
}

/**
 * The id, error state and ARIA wiring a Formik wrapper gives its control: the
 * control is named by its label, described by its error, and marked invalid
 * while the error shows.
 */
export const fieldA11y = ({
  name,
  id,
  touched,
  errors,
  describedBy
}: FieldA11yArgs) => {
  const inputId = id || name;
  const errorId = `${inputId}-error`;
  const rawError = getIn(touched, name) ? getIn(errors, name) : undefined;
  const error = rawError ? String(rawError) : undefined;
  const isInvalid = Boolean(error);
  const describedByIds = [describedBy, isInvalid ? errorId : undefined]
    .filter(Boolean)
    .join(" ");

  return {
    inputId,
    errorId,
    error,
    isInvalid,
    inputProps: {
      id: inputId,
      "aria-invalid": isInvalid || undefined,
      "aria-describedby": describedByIds || undefined
    }
  };
};

interface FieldLabelProps {
  htmlFor: string;
  children?: React.ReactNode;
  /** Shown above the control; otherwise the label is for screen readers only. */
  visible?: boolean;
  className?: string;
}

/** The control's label: screen-reader only unless `visible`. */
export const FieldLabel = ({
  htmlFor,
  children,
  visible = false,
  className
}: FieldLabelProps) =>
  children ? (
    <label htmlFor={htmlFor} className={cn(!visible && "sr-only", className)}>
      {children}
    </label>
  ) : null;

/** The field's validation message, referenced by the control's aria-describedby. */
export const FieldError = ({
  id,
  children,
  className
}: {
  id: string;
  children?: React.ReactNode;
  className?: string;
}) =>
  children ? (
    <div id={id} className={cn(errorClass, className)}>
      {children}
    </div>
  ) : null;
