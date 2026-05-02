import { SelectOption } from "@/Global/Types/types";
import React, { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverOverlay,
  PopoverTrigger,
} from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { cn } from "@/lib/utils";

const labeledCn = (
  ...classes: (string | boolean | undefined | null)[]
): string => {
  return classes.filter(Boolean).join(" ");
};

interface MultiSelectComboboxProps<T extends SelectOption> {
  items: T[]; // Сега Items е масив от T
  selectedIds: string[];
  onSelectIdsChange: (newIds: string[]) => void;
  getLabel: (item: T) => string; // getLabel приема елемент от тип T
  triggerPlaceholder?: string;
  searchPlaceholder: string;
  emptyMessage: string;
  label?: string;
}
export function MultiSelectCombobox<T extends SelectOption>({
  items,
  selectedIds,
  onSelectIdsChange,
  getLabel,
  triggerPlaceholder,
  searchPlaceholder,
  emptyMessage,
  label,
}: MultiSelectComboboxProps<T>): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

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

  // Получаваме избраните елементи и техните имена
  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const selectedNames = selectedItems.map((item) => getLabel(item));

  // Текстът, който се показва в бутона на Popover-а
  const triggerText =
    selectedIds.length > 0 ? selectedNames.join(", ") : triggerPlaceholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative group/labeled-input w-full cursor-pointer text-left"
          aria-expanded={open}
        >
          {label && (
            <label
              className={labeledCn(
                "absolute text-gray-500 transition-all duration-300 transform pointer-events-none z-10",
                "group-focus-within/labeled-input:text-primary",
                open || selectedIds.length > 0
                  ? "-top-0.5 text-xs left-3"
                  : "top-1/2 -translate-y-1/2 text-sm left-4",
              )}
            >
              {label}
            </label>
          )}
          <div
            className={labeledCn(
              "relative w-full h-12 bg-gray-100 dark:bg-card/80 hover:bg-gray-200 dark:hover:bg-card/90 focus:bg-gray-200 dark:focus:bg-card/90 rounded-t-md transition-all duration-300 px-4 pt-4 pb-1",
              "border-b-2 border-card",
              "outline-none",
              "flex items-center justify-between",
              "text-left",
              open && "bg-gray-200 dark:bg-card/90",
            )}
          >
            <span
              className={labeledCn(
                "transition-colors duration-300 truncate text-foreground",
                selectedIds.length > 0 ? "text-foreground" : "text-gray-400",
              )}
            >
              {triggerText}
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2 flex-shrink-0" />
          </div>
          <div
            className={labeledCn(
              "absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300",
              open || isFocused || selectedIds.length > 0 ? "w-full" : "w-0",
            )}
          />
        </button>
      </PopoverTrigger>
      {open && <PopoverOverlay onPointerDown={() => setOpen(false)} />}
      <PopoverContent
        align="start"
        sideOffset={8}
        className="z-[70] w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] p-0 overflow-hidden rounded-xl border border-border/60 shadow-2xl"
        onEscapeKeyDown={() => setOpen(false)}
        onInteractOutside={(event) => {
          // Keep the overlay responsible for outside clicks so we don't click through.
          event.preventDefault();
          setOpen(false);
        }}
      >
        <Command className="w-full">
          <CommandInput
            placeholder={searchPlaceholder}
            className="text-text-primary h-11"
          />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-[280px] overflow-auto">
            {items.map((item) => {
              const label = getLabel(item);
              const isSelected = selectedIds.includes(item.id);

              return (
                <CommandItem
                  key={item.id}
                  value={label}
                  onSelect={() => handleSelect(item.id)}
                  className="cursor-pointer hover:bg-primary hover:text-primary transition-colors duration-200"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      isSelected ? "opacity-100" : "opacity-0",
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
