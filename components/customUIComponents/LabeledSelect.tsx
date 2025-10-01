import React, { useState, forwardRef } from "react";
import { createRoot } from "react-dom/client";

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
          value={value}
          onChange={(e) => onValueChange(e.target.value as T)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "peer w-full h-12 bg-gray-200 focus:bg-gray-300 rounded-t-md transition-all duration-300 px-4 pt-4 pb-1",
            "border-b-2 border-gray-300",
            "outline-none",
            "appearance-none", // Remove default OS dropdown arrow
            "cursor-pointer"
          )}
        >
          {/* <option value="" disabled hidden>
            {placeholder}
          </option> */}
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

// // @/components/customUIComponents/LabeledSelect.tsx
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectTrigger,
//   SelectValue,
//   SelectGroup,
//   SelectItem,
// } from "@/components/ui/select";

// interface LabeledSelectProps<T extends string> {
//   label: string;
//   id: string;
//   value: T;
//   onValueChange: (value: T) => void;
//   placeholder: string;
//   options: {
//     id: T;
//     name: string;
//     duration?: number;
//     price?: number;
//   }[];
// }
// export function LabeledSelect<T extends string>({
//   label,
//   id,
//   value,
//   onValueChange,
//   placeholder,
//   options,
// }: LabeledSelectProps<T>) {
//   console.log("options", options);
//   return (
//     <div className="flex flex-col space-y-2">
//       <Label htmlFor={id} className="text-sm font-medium">
//         {label}
//       </Label>
//       <Select value={value} onValueChange={onValueChange}>
//         <SelectTrigger
//           className="h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
//           id={id}
//         >
//           <SelectValue placeholder={placeholder} />
//         </SelectTrigger>
//         <SelectContent className="bg-card/95 backdrop-blur-lg border-2 border-primary/20">
//           <SelectGroup>
//             {options.map((option) => (
//               <SelectItem
//                 key={option.id}
//                 value={option.id}
//                 className="focus:bg-primary/10"
//               >
//                 <div className="flex flex-col">
//                   <span className="font-medium">{option.name}</span>
//                   {option.duration && option.price && (
//                     <span className="text-xs text-muted-foreground">
//                       {option.duration} min - ${option.price}
//                     </span>
//                   )}
//                 </div>
//               </SelectItem>
//             ))}
//           </SelectGroup>
//         </SelectContent>
//       </Select>
//     </div>
//   );
// }
