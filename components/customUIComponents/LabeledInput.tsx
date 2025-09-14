import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React from "react";

interface LabeledInputProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  // Добавяме prop за типа на полето
  type?: React.HTMLInputTypeAttribute;
}

export function LabeledInput({
  label,
  id,
  value,
  onChange,
  placeholder,
  className,
  type = "text",
}: LabeledInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={cn(
          "h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl",
          className
        )}
        placeholder={placeholder}
      />
    </div>
  );
}
