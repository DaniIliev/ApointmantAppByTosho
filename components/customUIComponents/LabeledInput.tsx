import React, { useState, forwardRef } from "react";

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
      rows, // Използваме rows за условно рендиране
      onClear, // 👈 ДЕСТРУКТУРИРАМЕ НОВИЯ PROP
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const hasValue = value.length > 0;
    const isTextarea = rows !== undefined;

    // Проверка дали бутонът за изчистване трябва да се покаже
    const isClearable = onClear && hasValue;

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
      // ЗАБЕЛЕЖКА: bg-card/80 е класът, който искаме да запазим
      "peer w-full bg-card/80 focus:bg-card/90 rounded-t-md transition-all duration-300 px-4 pt-4 pb-1",
      "border-b-2 border-transparent",
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
    const finalLabelPosition =
      isFocused || hasValue
        ? "-top-0.5 text-xs left-3" // Позиция при активност/попълване
        : isTextarea
        ? "top-3 text-sm left-4" // По-висока начална позиция за textarea
        : "top-1/2 -translate-y-1/2 text-sm left-4"; // Начална позиция за стандартен input

    return (
      <div className="relative group/labeled-input w-full">
        {/*
          *** ФИКС ЗА AUTOFILLED ФОН НА БРАУЗЪРА ***
          (Оставяме стиловете за autofill, както са)
        */}
        <style jsx global>{`
          /* Предотвратява белия/жълт фон на Chrome/Safari при Autofill */
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
            "absolute text-gray-500 transition-all duration-300 transform pointer-events-none z-10",
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

        {/* 👈 НОВ ЕЛЕМЕНТ: Бутон за изчистване (рачка) */}
        {isClearable && (
          <button
            type="button"
            onClick={onClear} // 👈 Извиква подадената функция
            aria-label="Изчистване на полето"
            // Позициониране върху input/textarea
            className={cn(
              "absolute right-2 transition-opacity duration-200 cursor-pointer",
              // Позиция: центрира се за input, но се държи по-горе за textarea
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

// import React, { useState, forwardRef } from "react";

// // Simple utility function to merge Tailwind classes
// const cn = (...classes: (string | boolean | undefined | null)[]): string => {
//   return classes.filter(Boolean).join(" ");
// };

// // Обновен интерфейс за поддръжка на rows и разширен тип на onChange
// interface LabeledInputProps {
//   label: string;
//   id: string;
//   value: string;
//   // Разширен тип, за да приема събития от input И textarea
//   onChange: (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => void;
//   placeholder?: string;
//   className?: string;
//   type?: React.HTMLInputTypeAttribute;
//   // Опционален параметър rows - ако е зададен, рендира <textarea>
//   rows?: number;
//   onClear?: () => void;
// }

// // 2. Обновен тип на forwardRef, за да приема и двата DOM елемента
// export const LabeledInput = forwardRef<
//   HTMLInputElement | HTMLTextAreaElement,
//   LabeledInputProps
// >(
//   (
//     {
//       label,
//       id,
//       value,
//       onChange,
//       placeholder,
//       className,
//       type = "text",
//       rows, // Използваме rows за условно рендиране
//       ...props
//     },
//     ref
//   ) => {
//     const [isFocused, setIsFocused] = useState<boolean>(false);
//     const hasValue = value.length > 0;
//     const isTextarea = rows !== undefined;

//     // Логика за Date Input (прилага се само ако не е textarea)
//     const inputType =
//       !isTextarea &&
//       (type === "date" || type === "time") &&
//       !isFocused &&
//       !hasValue
//         ? "text"
//         : type;

//     // Базови класове, общи за input и textarea
//     const baseClasses = cn(
//       // ЗАБЕЛЕЖКА: bg-card/80 е класът, който искаме да запазим
//       "peer w-full bg-card/80 focus:bg-card/90 rounded-t-md transition-all duration-300 px-4 pt-4 pb-1",
//       "border-b-2 border-transparent",
//       "outline-none",
//       "placeholder-transparent focus:placeholder-gray-400",
//       className
//     );

//     // Класове, специфични за елемента
//     const elementClasses = isTextarea
//       ? cn(baseClasses, `min-h-12 resize-y`) // За Textarea: минимална височина и разрешено оразмеряване
//       : cn(baseClasses, "h-12"); // За Input: фиксирана височина

//     // Коригиране на позицията на label-а за textarea, когато не е фокусирано
//     const finalLabelPosition =
//       isFocused || hasValue
//         ? "-top-0.5 text-xs left-3" // Позиция при активност/попълване
//         : isTextarea
//         ? "top-3 text-sm left-4" // По-висока начална позиция за textarea
//         : "top-1/2 -translate-y-1/2 text-sm left-4"; // Начална позиция за стандартен input

//     return (
//       <div className="relative group/labeled-input w-full">
//         {/*
//           *** ФИКС ЗА AUTOFILLED ФОН НА БРАУЗЪРА ***
//           Този стилов блок използва псевдо-класата :-webkit-autofill
//           за да приложи голям box-shadow, който да презапише белия фон,
//           наложен от браузъра (обикновено с !important).
//           Цветът #fefefe е избран като прокси за "card" фон, за да се слее.
//         */}
//         <style jsx global>{`
//           /* Предотвратява белия/жълт фон на Chrome/Safari при Autofill */
//           input:-webkit-autofill,
//           input:-webkit-autofill:hover,
//           input:-webkit-autofill:focus,
//           textarea:-webkit-autofill,
//           textarea:-webkit-autofill:hover,
//           textarea:-webkit-autofill:focus {
//             /* Използваме box-shadow за да презапишем фона.
//                Цветът #fefefe е много светъл сив/бял, близък до 'card' */
//             -webkit-box-shadow: 0 0 0 1000px #fefefe inset !important;
//             box-shadow: 0 0 0 1000px #fefefe inset !important;

//             /* Осигурява че текстът остава тъмен и четлив */
//             -webkit-text-fill-color: #1f2937 !important; /* Прокси за тъмен текст (Tailwind gray-800) */

//             /* Премахва евентуални сини или жълти граници, наложени от браузъра */
//             transition: background-color 5000s ease-in-out 0s;
//           }
//         `}</style>

//         {/* Етикетът, който се "движи" */}
//         <label
//           htmlFor={id}
//           className={cn(
//             "absolute text-gray-500 transition-all duration-300 transform pointer-events-none z-10",
//             "group-focus-within/labeled-input:text-primary",
//             finalLabelPosition
//           )}
//         >
//           {label}
//         </label>

//         {/* 3. Условно Рендиране */}
//         {isTextarea ? (
//           <textarea
//             id={id}
//             // Ref cast за textarea
//             ref={ref as React.Ref<HTMLTextAreaElement>}
//             rows={rows}
//             value={value}
//             // onChange е съвместим
//             onChange={onChange}
//             onFocus={() => setIsFocused(true)}
//             onBlur={() => setIsFocused(false)}
//             // Забележка: pt-4 е приложен в elementClasses
//             className={elementClasses}
//             placeholder={!isFocused || !hasValue ? placeholder : ""}
//             {...props}
//           />
//         ) : (
//           <input
//             id={id}
//             // Ref cast за input
//             ref={ref as React.Ref<HTMLInputElement>}
//             type={inputType}
//             value={value}
//             // onChange cast за input
//             onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
//             onFocus={() => setIsFocused(true)}
//             onBlur={() => setIsFocused(false)}
//             className={elementClasses}
//             // Placeholder логика за type="text"
//             placeholder={
//               inputType === "text" && (!isFocused || !hasValue)
//                 ? placeholder
//                 : ""
//             }
//             {...props}
//           />
//         )}

//         {/* Подчертаваща линия */}
//         <div
//           className={cn(
//             "absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300",
//             isFocused || hasValue ? "w-full" : "w-0"
//           )}
//         />
//       </div>
//     );
//   }
// );

// LabeledInput.displayName = "LabeledInput";
