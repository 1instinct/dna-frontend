import React, { useState } from "react";
import { Field } from "formik";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@lib/utils";

const inputClass =
  "w-full rounded-lg border-2 border-dashed border-border bg-background px-3 py-2.5 pr-10 font-body text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand";

const errorClass =
  "mt-1 text-left font-body text-xs font-bold text-destructive";

export const FormikPassword = ({
  field: { ...fields },
  form: { touched, errors },
  styles,
  ...props
}: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const isInvalid = Boolean(touched[fields.name] && errors[fields.name]);

  const togglePasswordVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <>
      <div className="relative w-full">
        <Field
          {...props}
          {...fields}
          type={showPassword ? "text" : "password"}
          placeholder={props.label}
          className={cn(inputClass, isInvalid && "border-destructive")}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-2.5 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center border-none bg-transparent p-1 text-muted-foreground opacity-60 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
      {touched[fields.name] && errors[fields.name] ? (
        <div className={errorClass}>{errors[fields.name]}</div>
      ) : null}
    </>
  );
};
