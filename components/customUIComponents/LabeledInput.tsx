import React, {
  useState,
  forwardRef,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(" ");
};

interface LabeledInputProps {
  label: string;
  id: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  placeholder?: string;
  className?: string;
  type?: React.HTMLInputTypeAttribute;
  multiline?: boolean;
  rows?: number;
  onClear?: () => void;
  required?: boolean;
  errorText?: string;
  showError?: boolean;
  min?: string | number;
  max?: string | number;
  disabled?: boolean;
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
      multiline = false,
      rows,
      onClear,
      required,
      errorText,
      showError,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const hasValue = value?.length > 0;
    const isTextarea = multiline || rows !== undefined;
    const textareaRows = rows ?? 1;
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
      "peer w-full rounded-t-md transition-all duration-300 px-4 pt-4 pb-1",
      disabled
        ? "bg-gray-200/50 dark:bg-muted/20 text-muted-foreground cursor-not-allowed"
        : "bg-gray-100 dark:bg-card/80 focus:bg-gray-200 dark:focus:bg-card/90 text-text-primary/75 focus:text-text-primary",
      "border-b-2",
      isErroredEmpty ? "border-red-500" : "border-transparent",
      "outline-none",
      isFocused && !disabled ? "placeholder-gray-400" : "placeholder-transparent",
      isClearable && !disabled || disabled ? "pr-10" : "pr-4",
      className,
    );

    const elementClasses = isTextarea
      ? cn(baseClasses, "min-h-12 resize-none overflow-hidden")
      : cn(baseClasses, "h-12");

    const resizeTextarea = useCallback(
      (element?: HTMLTextAreaElement | null) => {
        if (!element) return;
        element.style.height = "auto";
        element.style.height = `${element.scrollHeight}px`;
      },
      [],
    );

    useEffect(() => {
      if (isTextarea) {
        resizeTextarea(textareaRef.current);
      }
    }, [displayValue, isTextarea, resizeTextarea]);

    const finalLabelPosition = isErroredEmpty
      ? "text-red-500"
      : isFocused || hasValue
        ? "-top-0.5 text-xs left-3"
        : isTextarea
          ? "top-3 text-sm left-4"
          : "top-1/2 -translate-y-1/2 text-sm left-4";

    const hideLabelForDate = type === "date" && !isFocused && !hasValue;

    const labelClasses = cn(
      "absolute transition-all duration-300 transform pointer-events-none z-10 select-none",
      finalLabelPosition,
      isErroredEmpty ? "text-red-500" : (disabled ? "text-muted-foreground/60" : "text-gray-500"),
      !disabled && "group-focus-within/labeled-input:text-primary",
      hideLabelForDate && "opacity-0",
    );

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
            className={labelClasses}
          >
            {label}
          </label>

          {isTextarea ? (
            <textarea
              id={id}
              ref={(element) => {
                textareaRef.current = element;
                if (!ref) return;
                if (typeof ref === "function") {
                  ref(element);
                } else {
                  (
                    ref as React.MutableRefObject<
                      HTMLInputElement | HTMLTextAreaElement | null
                    >
                  ).current = element;
                }
              }}
              rows={textareaRows}
              value={displayValue}
              onChange={(e) => {
                resizeTextarea(e.currentTarget);
                onChange(e);
              }}
              disabled={disabled}
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
                disabled={disabled}
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
              {isPassword && !disabled && (
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground hover:text-primary/80 z-20"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              )}
              {disabled && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 z-20">
                  <Lock size={16} />
                </div>
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
                "h-5 w-5 rounded-full text-muted-foreground hover:text-primary/80 flex items-center justify-center z-20",
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
              disabled || (isFocused || hasValue) && !isErroredEmpty
                ? "w-full"
                : "w-0",
            )}
          />
          {isErroredEmpty && errorText && (
            <p className="mt-1 text-red-500  text-xs">{errorText}</p>
          )}
        </div>
      </>
    );
  },
);

LabeledInput.displayName = "LabeledInput";
