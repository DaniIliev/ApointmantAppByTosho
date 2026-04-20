import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type IconElement = React.ReactElement<{ className?: string; size?: number }>;

interface CustomTooltipProps {
  onClick: () => void;
  tooltipText?: string;
  icon: IconElement;
  iconClassName?: string;
  type?: "button" | "submit" | "reset";
}

export function CustomTooltip({
  onClick,
  tooltipText,
  icon,
  iconClassName = "h-5 w-5",
  type = "button",
}: CustomTooltipProps) {
  const iconWithClassName = React.cloneElement(icon, {
    className: `${icon.props.className || ""} ${iconClassName}`.trim(),
    size: 18,
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type={type}
            onClick={onClick}
            className="p-2 rounded-full text-text-primary hover:bg-gray-200 dark:hover:bg-primary/20 transition-colors cursor-pointer"
          >
            {iconWithClassName}
          </button>
        </TooltipTrigger>
        {tooltipText && (
          <TooltipContent>
            <p className="text-white">{tooltipText}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
