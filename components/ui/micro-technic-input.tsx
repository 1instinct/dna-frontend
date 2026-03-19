import React, { forwardRef, useState } from "react";
import { motion } from "framer-motion";

export interface MicroTechnicInputProps {
  placeholder?: string;
  buttonText?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  tagline?: string;
  className?: string;
}

export const MicroTechnicInput = forwardRef<
  HTMLInputElement,
  MicroTechnicInputProps
>(
  (
    {
      placeholder = "enter your email",
      buttonText = "SUBMIT",
      type = "text",
      value: controlledValue,
      onChange,
      onSubmit,
      disabled = false,
      loading = false,
      loadingText = "SENDING...",
      tagline = "MICRO TECHNIC",
      className = ""
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState("");
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalValue(e.target.value);
      onChange?.(e);
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentValue || disabled || loading) return;
      onSubmit?.(currentValue);
      if (!isControlled) setInternalValue("");
    };

    return (
      <div className={`flex flex-col items-center gap-4 ${className}`}>
        {/* Tagline */}
        {tagline && (
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.3em" }}
            animate={{ opacity: 1, letterSpacing: "0.15em" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-microtechnic text-[0.65rem] uppercase tracking-[0.15em] text-cyan-400/70"
          >
            {tagline}
          </motion.span>
        )}

        {/* Input + Button pill */}
        <form onSubmit={handleSubmit} className="relative w-full max-w-sm">
          <input
            ref={ref}
            type={type}
            value={currentValue}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled || loading}
            className="
              w-full
              rounded-full
              border-0
              bg-[#1a0a2e]
              px-5 py-3 pr-[130px]
              font-microtechnic text-sm
              text-[#c084fc]
              outline-none
              transition-shadow duration-300
              placeholder:text-[#7c3aed]/50
              focus:placeholder:text-[#ff008a]/60
              disabled:opacity-50
            "
            style={{
              boxShadow: [
                "-6px -6px 20px rgba(144, 0, 147, 0.5)",
                "6px 6px 20px rgba(0, 0, 0, 0.8)",
                "inset 1px 3px 24px rgba(26, 3, 0, 0.6)"
              ].join(", ")
            }}
          />

          <button
            type="submit"
            disabled={disabled || loading || !currentValue}
            className="
              absolute right-1 top-1 bottom-1
              rounded-full
              border border-[rgba(255,0,138,0.15)]
              bg-[#2d0a3e]
              px-5
              font-microtechnic text-xs
              tracking-wider
              text-[#e9b0ff]
              transition-all duration-300
              hover:bg-[#ff008a] hover:text-white
              active:scale-95
              disabled:opacity-40 disabled:hover:bg-[#2d0a3e] disabled:hover:text-[#e9b0ff]
            "
            style={{
              boxShadow: [
                "-4px -4px 10px rgba(144, 0, 147, 0.08)",
                "1px 1px 18px rgba(0, 0, 0, 0.25)",
                "inset 1px 2px 6px rgba(0, 0, 0, 0.4)"
              ].join(", ")
            }}
          >
            {loading ? loadingText : buttonText}
          </button>
        </form>
      </div>
    );
  }
);

MicroTechnicInput.displayName = "MicroTechnicInput";
