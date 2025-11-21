"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Users, UserPlus, Search, Check, X } from "lucide-react";
import { User } from "../../types";

interface CardAssigneesProps {
  assignedUserIds: string[];
  availableUsers: User[];
  onToggleUser: (userId: string) => void;
}

export function CardAssignees({
  assignedUserIds,
  availableUsers,
  onToggleUser,
}: CardAssigneesProps) {
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium flex items-center gap-2 text-foreground">
          <Users className="w-4 h-4" />
          Assignees
        </label>
        {/* Add Assignee Button with Popover */}
        <Popover
          open={assigneePopoverOpen}
          onOpenChange={setAssigneePopoverOpen}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all"
            >
              <UserPlus className="w-4 h-4 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            <div className="flex flex-col">
              {/* Search Input */}
              <div className="p-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={assigneeSearch}
                    onChange={(e) => setAssigneeSearch(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
              </div>
              {/* User List */}
              <div className="max-h-64 overflow-y-auto">
                {availableUsers
                  .filter((user) =>
                    `${user.firstName} ${user.lastName}`
                      .toLowerCase()
                      .includes(assigneeSearch.toLowerCase())
                  )
                  .map((user) => {
                    const isSelected = assignedUserIds.includes(user._id);
                    return (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => {
                          onToggleUser(user._id);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                      >
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="text-xs">
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex-1 text-sm font-medium text-foreground">
                          {user.firstName} {user.lastName}
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Selected Assignees - Avatar Display */}
        <div className="flex items-center gap-1">
          {assignedUserIds.map((userId) => {
            const user = availableUsers.find((u) => u._id === userId);
            if (!user) return null;
            return (
              <div key={user._id} className="relative group">
                <Avatar className="w-8 h-8 border-2 border-background ring-1 ring-border hover:ring-primary transition-all cursor-pointer">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xs font-semibold">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                {/* Tooltip on Hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {user.firstName} {user.lastName}
                </div>
                {/* Remove Button on Hover */}
                <button
                  type="button"
                  onClick={() => onToggleUser(user._id)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
