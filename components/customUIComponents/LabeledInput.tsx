import React, { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";

// Simple utility function to merge Tailwind classes
const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(" ");
};

// Обновен интерфейс, вече включва onClear
interface LabeledInputProps {
  label: string;
  id: string;
  value: string;
  // Разширен тип, за да приема събития от input И textarea
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
  className?: string;
  type?: React.HTMLInputTypeAttribute;
  // Опционален параметър rows - ако е зададен, рендира <textarea>
  rows?: number;
  // 👈 НОВА ФУНКЦИЯ ЗА ИЗЧИСТВАНЕ
  onClear?: () => void;
  required?: boolean; // Позволява required атрибут
  errorText?: string; // Текст за грешка при празно задължително поле
  showError?: boolean; // Кога да показваме грешката (например при Submit)
}

// Обновен тип на forwardRef, за да приема и двата DOM елемента
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
    const hasValue = value.length > 0;
    const isTextarea = rows !== undefined;
    const isErroredEmpty = Boolean(showError && required && !hasValue);

    // Проверка дали бутонът за изчистване трябва да се покаже
    const isClearable = onClear && hasValue;

    // За date/time/datetime-local винаги запазваме оригиналния тип
    // за да работи нативният picker на мобилни устройства
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    const baseClasses = cn(
      "peer w-full bg-card/80 focus:bg-card/90 text-text-primary/75 focus:text-text-primary rounded-t-md transition-all duration-300 px-4 pt-4 pb-1",
      "border-b-2",
      isErroredEmpty ? "border-red-500" : "border-transparent",
      "outline-none",
      "placeholder-transparent focus:placeholder-gray-400",
      // 👈 Динамичен padding, за да направи място за иконата
      isClearable ? "pr-8" : "pr-4",
      className
    );

    // Класове, специфични за елемента
    const elementClasses = isTextarea
      ? cn(baseClasses, `min-h-12 resize-y`) // За Textarea: минимална височина и разрешено оразмеряване
      : cn(baseClasses, "h-12"); // За Input: фиксирана височина

    // Коригиране на позицията на label-а за textarea, когато не е фокусирано
    const finalLabelPosition = isErroredEmpty
      ? "text-red-500"
      : isFocused || hasValue
      ? "-top-0.5 text-xs left-3"
      : isErroredEmpty
      ? "text-red-500"
      : isTextarea
      ? "top-3 text-sm left-4" // По-висока начална позиция за textarea
      : "top-1/2 -translate-y-1/2 text-sm left-4"; // Начална позиция за стандартен input

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
              /* Използваме box-shadow за да презапишем фона. 
              Цветът #fefefe е много светъл сив/бял, близък до 'card' */
              -webkit-box-shadow: 0 0 0 1000px #fefefe inset !important;
              box-shadow: 0 0 0 1000px #fefefe inset !important;

              /* Осигурява че текстът остава тъмен и четлив */
              -webkit-text-fill-color: #1f2937 !important; /* Прокси за тъмен текст (Tailwind gray-800) */

              /* Премахва евентуални сини или жълти граници, наложени от браузъра */
              transition: background-color 5000s ease-in-out 0s;
            }
          `}</style>

          {/* Етикетът, който се "движи" */}
          <label
            htmlFor={id}
            className={cn(
              "absolute transition-all duration-300 transform pointer-events-none z-10",
              isErroredEmpty ? "text-red-500" : "text-gray-500",
              "group-focus-within/labeled-input:text-primary",
              finalLabelPosition
            )}
          >
            {label}
          </label>

          {/* 3. Условно Рендиране на input/textarea */}
          {isTextarea ? (
            <textarea
              id={id}
              // Ref cast за textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              rows={rows}
              value={value}
              // onChange е съвместим
              onChange={onChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              // Забележка: pt-4 е приложен в elementClasses
              className={elementClasses}
              placeholder={!isFocused || !hasValue ? placeholder : ""}
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
                value={value}
                onChange={
                  onChange as React.ChangeEventHandler<HTMLInputElement>
                }
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={elementClasses}
                placeholder={
                  inputType === "text" && (!isFocused || !hasValue)
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

          {/* 👈 НОВ ЕЛЕМЕНТ: Бутон за изчистване (рачка) */}
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
              {/* Иконка 'X' (Close) */}
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
