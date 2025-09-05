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
}

export function CustomTooltip({
  onClick,
  tooltipText,
  icon,
  iconClassName = "h-5 w-5",
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
            onClick={onClick}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            {iconWithClassName}
          </button>
        </TooltipTrigger>
        {tooltipText && (
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
