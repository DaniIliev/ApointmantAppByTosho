import React, { useState, forwardRef } from "react";
import { createRoot } from "react-dom/client";

// Simple utility function to merge Tailwind classes
const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(" ");
};

interface LabeledInputProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  type?: React.HTMLInputTypeAttribute;
}

// Използваме forwardRef, за да може компонентът да приема ref
export const LabeledInput = forwardRef<HTMLInputElement, LabeledInputProps>(
  (
    {
      label,
      id,
      value,
      onChange,
      placeholder,
      className,
      type = "text",
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const hasValue = value.length > 0;

    return (
      <div className="relative group/labeled-input w-full">
        {/* Етикетът, който се "движи" */}
        <label
          htmlFor={id}
          className={cn(
            "absolute text-gray-500 transition-all duration-300 transform pointer-events-none z-10",
            "group-focus-within/labeled-input:text-primary",
            isFocused || hasValue
              ? "-top-0.5 text-xs left-3" // Позиция при фокус или стойност
              : "top-1/2 -translate-y-1/2 text-sm left-4" // Начална позиция
          )}
        >
          {label}
        </label>

        {/* Custom Input поле с псевдо-елементи за бордер */}
        <input
          id={id}
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "peer w-full h-12 bg-gray-200 focus:bg-gray-300 rounded-t-md transition-all duration-300 px-4 pt-4 pb-1",
            "border-b-2 border-transparent",
            "outline-none",
            "placeholder-transparent focus:placeholder-gray-400",
            className
          )}
          // placeholder={!isFocused || !hasValue ? placeholder : ""}
          {...props}
        />
        <div
          className={cn(
            "absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300",
            isFocused || hasValue ? "w-full" : "w-0"
          )}
        />
      </div>
    );
  }
);

LabeledInput.displayName = "LabeledInput";
