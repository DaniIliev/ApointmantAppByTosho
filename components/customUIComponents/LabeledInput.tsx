import React, { useState, forwardRef } from "react";
// createRoot е премахнат, тъй като не е нужен.

// Simple utility function to merge Tailwind classes
const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(" ");
};

// 1. Обновен интерфейс за поддръжка на rows и разширен тип на onChange
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
}

// 2. Обновен тип на forwardRef, за да приема и двата DOM елемента
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
      rows, // Използваме rows за условно рендиране
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const hasValue = value.length > 0;
    const isTextarea = rows !== undefined;

    // Логика за Date Input (прилага се само ако не е textarea)
    const inputType =
      !isTextarea &&
      (type === "date" || type === "time") &&
      !isFocused &&
      !hasValue
        ? "text"
        : type;

    // Базови класове, общи за input и textarea
    const baseClasses = cn(
      "peer w-full bg-gray-200 focus:bg-gray-300 rounded-t-md transition-all duration-300 px-4 pt-4 pb-1",
      "border-b-2 border-transparent",
      "outline-none",
      "placeholder-transparent focus:placeholder-gray-400",
      className
    );

    // Класове, специфични за елемента
    const elementClasses = isTextarea
      ? cn(baseClasses, `min-h-12 resize-y`) // За Textarea: минимална височина и разрешено оразмеряване
      : cn(baseClasses, "h-12"); // За Input: фиксирана височина

    // Коригиране на позицията на label-а за textarea, когато не е фокусирано
    // За multiline input, лейбълът трябва да започне по-високо, отколкото 'top-1/2'
    const finalLabelPosition =
      isFocused || hasValue
        ? "-top-0.5 text-xs left-3" // Позиция при активност/попълване
        : isTextarea
        ? "top-3 text-sm left-4" // По-висока начална позиция за textarea
        : "top-1/2 -translate-y-1/2 text-sm left-4"; // Начална позиция за стандартен input

    return (
      <div className="relative group/labeled-input w-full">
        {/* Етикетът, който се "движи" */}
        <label
          htmlFor={id}
          className={cn(
            "absolute text-gray-500 transition-all duration-300 transform pointer-events-none z-10",
            "group-focus-within/labeled-input:text-primary",
            finalLabelPosition
          )}
        >
          {label}
        </label>

        {/* 3. Условно Рендиране */}
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
            {...props}
          />
        ) : (
          <input
            id={id}
            // Ref cast за input
            ref={ref as React.Ref<HTMLInputElement>}
            type={inputType}
            value={value}
            // onChange cast за input
            onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={elementClasses}
            // Placeholder логика за type="text"
            placeholder={
              inputType === "text" && (!isFocused || !hasValue)
                ? placeholder
                : ""
            }
            {...props}
          />
        )}

        {/* Подчертаваща линия */}
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
