import React, { useState } from "react";
// Няма нужда от forwardRef и createRoot тук, те са премахнати, тъй като не се използват.

const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(" ");
};

interface LabeledSelectProps<T extends string> {
  label: string;
  id: string;
  value: T;
  onValueChange: (value: T) => void;
  placeholder: string;
  options: {
    id: T;
    name: string;
    duration?: number;
    price?: number;
  }[];
}

export function LabeledSelect<T extends string>({
  label,
  id,
  value,
  onValueChange,
  placeholder,
  options,
}: LabeledSelectProps<T>) {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const hasValue = !!value;

  return (
    <div className="relative group/labeled-input w-full">
      <label
        htmlFor={id}
        className={cn(
          "absolute text-gray-500 transition-all duration-300 transform pointer-events-none z-10",
          "group-focus-within/labeled-input:text-primary",
          isFocused || hasValue
            ? "-top-0.5 text-xs left-3"
            : "top-1/2 -translate-y-1/2 text-sm left-4"
        )}
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value || ""}
          onChange={(e) => onValueChange(e.target.value as T)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "text-text-primary peer w-full h-12 bg-gray-100 dark:bg-card/80 focus:bg-gray-200 dark:focus:bg-card/90 rounded-t-md transition-all duration-300 px-4 pt-4 pb-1",
            "border-b-2 border-card",
            "outline-none",
            "appearance-none", // Премахва стрелката
            "cursor-pointer"
          )}
        >
          <option value="" disabled>
            {isFocused && placeholder}
          </option>

          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <div
          className={cn(
            "absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300",
            isFocused || hasValue ? "w-full" : "w-0"
          )}
        />
      </div>
    </div>
  );
}
