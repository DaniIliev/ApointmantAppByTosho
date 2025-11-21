"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { Plus, ChevronsUpDown, Check } from "lucide-react";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";

export interface SimpleBoard {
  _id: string;
  title: string;
}

export function BoardSelector({
  boards,
  selectedBoardId,
  onSelect,
  onCreate,
}: {
  boards: SimpleBoard[];
  selectedBoardId: string | null;
  onSelect: (id: string) => void;
  onCreate: (title: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const selected = useMemo(
    () => boards.find((b) => b._id === selectedBoardId) || null,
    [boards, selectedBoardId]
  );

  const handleCreate = () => {
    const title = newTitle.trim();
    if (!title) return;
    onCreate(title);
    setNewTitle("");
    setCreating(false);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="default" className="gap-2">
          {selected ? selected.title : "Select board"}
          <ChevronsUpDown className="w-4 h-4 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search boards..." />
          <CommandEmpty>No boards found.</CommandEmpty>
          <CommandGroup heading="Boards">
            {boards.map((b) => (
              <CommandItem
                key={b._id}
                onSelect={() => {
                  onSelect(b._id);
                  setOpen(false);
                }}
                className="flex items-center gap-2 hover:bg-primary/10 focus:bg-primary/10 aria-selected:bg-primary/15 aria-selected:text-primary rounded-sm"
              >
                <Check
                  className={`w-4 h-4 text-primary ${
                    selectedBoardId === b._id ? "opacity-100" : "opacity-0"
                  }`}
                />
                <span>{b.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          {!creating ? (
            <div className="p-2 flex items-center justify-center">
              <Button
                variant="default"
                className="flex items-center justify-center"
                onClick={() => setCreating(true)}
              >
                <Plus className="w-4 h-4" /> Create board
              </Button>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              <LabeledInput
                id="board-name"
                label="Board name"
                placeholder="Board name"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 text-primary border-primary hover:bg-primary/10"
                  onClick={() => setCreating(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={handleCreate}
                >
                  Create
                </Button>
              </div>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
