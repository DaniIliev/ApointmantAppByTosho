import React, { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";

const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(" ");
};

interface LabeledInputProps {
  label: string;
  id: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
  className?: string;
  type?: React.HTMLInputTypeAttribute;
  rows?: number;
  onClear?: () => void;
  required?: boolean;
  errorText?: string;
  showError?: boolean;
}

export const LabeledInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  LabeledInputProps
>(
  (
    {
      label,
      id,
      value,
      onChange,
      placeholder,
      className,
      type = "text",
      rows,
      onClear,
      required,
      errorText,
      showError,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const hasValue = value?.length > 0;
    const isTextarea = rows !== undefined;
    const isErroredEmpty = Boolean(showError && required && !hasValue);
    // Normalize display for date values passed in dd.MM.yyyy
    const displayValue = React.useMemo(() => {
      if (type === "date" && typeof value === "string") {
        const m = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
        if (m) {
          const [, dd, mm, yyyy] = m;
          return `${yyyy}-${mm}-${dd}`;
        }
      }
      return value;
    }, [type, value]);

    const isClearable = onClear && hasValue;

    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    const baseClasses = cn(
      "peer w-full bg-card/80 focus:bg-card/90 text-text-primary/75 focus:text-text-primary rounded-t-md transition-all duration-300 px-4 pt-4 pb-1",
      "border-b-2",
      isErroredEmpty ? "border-red-500" : "border-transparent",
      "outline-none",
      isFocused ? "placeholder-gray-400" : "placeholder-transparent",
      isClearable ? "pr-8" : "pr-4",
      className
    );

    const elementClasses = isTextarea
      ? cn(baseClasses, `min-h-12 resize-y`)
      : cn(baseClasses, "h-12");

    const finalLabelPosition = isErroredEmpty
      ? "text-red-500"
      : isFocused || hasValue
      ? "-top-0.5 text-xs left-3"
      : isErroredEmpty
      ? "text-red-500"
      : isTextarea
      ? "top-3 text-sm left-4"
      : "top-1/2 -translate-y-1/2 text-sm left-4";

    const hideLabelForDate = type === "date" && !isFocused && !hasValue;

    return (
      <>
        <div className="relative group/labeled-input w-full">
          <style jsx global>{`
            input:-webkit-autofill,
            input:-webkit-autofill:hover,
            input:-webkit-autofill:focus,
            textarea:-webkit-autofill,
            textarea:-webkit-autofill:hover,
            textarea:-webkit-autofill:focus {
              -webkit-box-shadow: 0 0 0 1000px #fefefe inset !important;
              box-shadow: 0 0 0 1000px #fefefe inset !important;
              -webkit-text-fill-color: #1f2937 !important;
              transition: background-color 5000s ease-in-out 0s;
            }

            /* Ensure native date/time value is always visible */
            input[type="date"]::-webkit-datetime-edit,
            input[type="time"]::-webkit-datetime-edit,
            input[type="datetime-local"]::-webkit-datetime-edit {
              color: inherit !important;
            }

            /* Keep native date/time value visible when not focused */
            input[type="date"]::-webkit-calendar-picker-indicator,
            input[type="time"]::-webkit-calendar-picker-indicator,
            input[type="datetime-local"]::-webkit-calendar-picker-indicator {
              opacity: 0.6;
            }
          `}</style>

          <label
            htmlFor={id}
            className={cn(
              "absolute transition-all duration-300 transform pointer-events-none z-10",
              isErroredEmpty ? "text-red-500" : "text-gray-500",
              "group-focus-within/labeled-input:text-primary",
              finalLabelPosition,
              hideLabelForDate && "opacity-0"
            )}
          >
            {label}
          </label>

          {isTextarea ? (
            <textarea
              id={id}
              ref={ref as React.Ref<HTMLTextAreaElement>}
              rows={rows}
              value={displayValue}
              onChange={onChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={elementClasses}
              placeholder={isFocused && !hasValue ? placeholder : ""}
              required={required}
              aria-invalid={isErroredEmpty}
              {...props}
            />
          ) : (
            <div className="relative">
              <input
                id={id}
                ref={ref as React.Ref<HTMLInputElement>}
                type={inputType}
                value={displayValue}
                onChange={
                  onChange as React.ChangeEventHandler<HTMLInputElement>
                }
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={elementClasses}
                placeholder={
                  type === "date" ||
                  type === "time" ||
                  type === "datetime-local"
                    ? placeholder
                    : isFocused && !hasValue
                    ? placeholder
                    : ""
                }
                required={required}
                aria-invalid={isErroredEmpty}
                {...props}
              />
              {isPassword && (
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground hover:text-primary/80 z-20"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}
            </div>
          )}

          {isClearable && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Изчистване на полето"
              className={cn(
                "absolute right-2 transition-opacity duration-200 cursor-pointer",
                isTextarea ? "top-4" : "top-1/2 -translate-y-1/2",
                "h-5 w-5 rounded-full text-muted-foreground hover:text-primary/80 flex items-center justify-center z-20"
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          <div
            className={cn(
              "absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300",
              (isFocused || hasValue) && !isErroredEmpty ? "w-full" : "w-0"
            )}
          />
          {isErroredEmpty && errorText && (
            <p className="mt-1 text-red-500  text-xs">{errorText}</p>
          )}
        </div>
      </>
    );
  }
);

LabeledInput.displayName = "LabeledInput";
