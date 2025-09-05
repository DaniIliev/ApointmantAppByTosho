// @/components/customUIComponents/LabeledSelect.tsx
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";

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
  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          className="h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
          id={id}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-card/95 backdrop-blur-lg border-2 border-primary/20">
          <SelectGroup>
            {options.map((option) => (
              <SelectItem
                key={option.id}
                value={option.id}
                className="focus:bg-primary/10"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{option.name}</span>
                  {option.duration && option.price && (
                    <span className="text-xs text-muted-foreground">
                      {option.duration} min - ${option.price}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
