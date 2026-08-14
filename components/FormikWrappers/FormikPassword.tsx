import React, { useState } from "react";
import { Field } from "formik";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@lib/utils";

const inputClass =
  "neon-focus w-full rounded-lg border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm px-3 py-3 pr-10 font-body text-sm text-white outline-none transition-all duration-300 placeholder:text-white/30 shadow-[inset_0_1px_3px_rgba(0,0,0,0.3),inset_0_-1px_0_rgba(255,255,255,0.04)] hover:border-white/[0.15] hover:bg-white/[0.06]";

const errorClass = "mt-1 text-left font-body text-xs font-bold text-neon-pink";

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
          className={cn(inputClass, isInvalid && "border-neon-pink")}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-2.5 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center border-none bg-transparent p-1 text-white/40 transition-opacity hover:text-white/70 focus:text-white/70 focus:outline-none"
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
