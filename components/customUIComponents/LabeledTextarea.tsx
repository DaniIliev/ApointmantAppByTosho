import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface LabeledTextareaProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export function LabeledTextarea({
  label,
  id,
  value,
  onChange,
  placeholder,
  className,
  rows,
}: LabeledTextareaProps) {
  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Textarea
        id="notes"
        value={value}
        onChange={onChange}
        rows={rows}
        className={cn(
          "min-h-[100px] border-2 border-border focus:border-primary focus-visible:border-primary focus-visible:ring-0 transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl resize-none",
          className
        )}
        placeholder={placeholder}
      />
    </div>
  );
}
