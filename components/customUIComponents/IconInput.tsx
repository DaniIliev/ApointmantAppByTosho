import { cn } from "@/lib/utils";
import React from "react";
import { Input } from "../ui/input";

interface IconInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const IconInput = React.forwardRef<HTMLInputElement, IconInputProps>(
  ({ icon, className, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none">
            {icon}
          </div>
        )}
        <Input
          ref={ref}
          className={cn(
            "w-full h-12 rounded-xl transition-all duration-300",
            icon && "pl-10", // Добавяме отстъп, ако има икона
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
IconInput.displayName = "IconInput";
