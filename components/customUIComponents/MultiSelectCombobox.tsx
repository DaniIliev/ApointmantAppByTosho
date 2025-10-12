import { SelectOption } from "@/Global/Types/types";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { PopoverContent } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { cn } from "@/lib/utils";

interface MultiSelectComboboxProps<T extends SelectOption> {
  items: T[]; // Сега Items е масив от T
  selectedIds: string[];
  onSelectIdsChange: (newIds: string[]) => void;
  getLabel: (item: T) => string; // getLabel приема елемент от тип T
  triggerPlaceholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
}
export function MultiSelectCombobox<T extends SelectOption>({
  items,
  selectedIds,
  onSelectIdsChange,
  getLabel,
  triggerPlaceholder,
  searchPlaceholder,
  emptyMessage,
}: MultiSelectComboboxProps<T>): React.ReactElement {
  const [open, setOpen] = useState(false);

  const handleSelect = (itemId: string) => {
    const isSelected = selectedIds.includes(itemId);
    let newSelectedIds;

    if (isSelected) {
      // Премахване на ID-то
      newSelectedIds = selectedIds.filter((id) => id !== itemId);
    } else {
      // Добавяне на ID-то
      newSelectedIds = [...selectedIds, itemId];
    }

    // Използваме предоставената callback функция за обновяване на състоянието
    onSelectIdsChange(newSelectedIds);

    // Оставяме popover-а отворен за улесняване на множествения избор
  };

  // Текстът, който се показва в бутона на Popover-а
  const triggerText =
    selectedIds.length > 0
      ? `${selectedIds.length} elements selected`
      : triggerPlaceholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {triggerText}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      {/* Класът за ширина w-[var(--radix-popover-trigger-width)] е специфичен за shadcn/ui, 
          тук го симулираме с w-full в нашия псевдо-PopoverContent */}
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup>
            {items.map((item) => {
              const label = getLabel(item);
              const isSelected = selectedIds.includes(item.id);

              return (
                <CommandItem
                  key={item.id}
                  // CommandItem използва 'value' за филтриране.
                  value={label}
                  onSelect={() => handleSelect(item.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      isSelected ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
