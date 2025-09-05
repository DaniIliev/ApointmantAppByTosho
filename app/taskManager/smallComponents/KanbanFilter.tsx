import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Check,
  Circle,
  User,
  XCircle,
  CalendarDays,
  ChevronRight,
} from "lucide-react";
import {
  getDueDateIndicator,
  getPriorityIndicator,
  getStatusIndicator,
} from "@/Global/Utils/statusIndicator";
import {
  KAN_TASK_PRIORITY_OPTIONS,
  UserPossibleAssignes,
} from "@/components/InteractiveKanbanBoard/KanbanboardUtils";
import { getInitials } from "@/Global/Utils/commonFn";
import { formatDateAndTime } from "@/Global/Utils/commonFn";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useTranslation } from "react-i18next";

interface KanbanFiltersProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  selectedPlannedEndDateFilters: string[];
  setSelectedPlannedEndDateFilters: React.Dispatch<
    React.SetStateAction<string[]>
  >;
  selectedPriorityFilters: string[];
  setSelectedPriorityFilters: React.Dispatch<React.SetStateAction<string[]>>;
  selectedStatusFilters: string[];
  setSelectedStatusFilters: React.Dispatch<React.SetStateAction<string[]>>;
  allUserOptions: UserPossibleAssignes[];
  selectedAssignedUsersFilters: string[];
  setSelectedAssignedUsersFilters: React.Dispatch<
    React.SetStateAction<string[]>
  >;
  setShowFinishedTasks: React.Dispatch<React.SetStateAction<boolean>>;
  showFinishedTasks: boolean;
  selectedCustomDueDate: Date | undefined;
  setSelectedCustomDueDate: React.Dispatch<
    React.SetStateAction<Date | undefined>
  >;
}

const dueDateFilterOptions = [
  { value: "Late", labelKey: "Late" },
  { value: "Today", labelKey: "Today" },
  { value: "Tomorrow", labelKey: "Tomorrow" },
  { value: "This Week", labelKey: "This Week" },
  { value: "Next Week", labelKey: "Next Week" },
  { value: "Future", labelKey: "Future" },
  { value: "Custom Date", labelKey: "Custom Date" },
  { value: "No date", labelKey: "No date" },
];

const KanbanFilters: React.FC<KanbanFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedPlannedEndDateFilters,
  setSelectedPlannedEndDateFilters,
  selectedPriorityFilters,
  setSelectedPriorityFilters,
  selectedStatusFilters,
  setSelectedStatusFilters,
  allUserOptions,
  selectedAssignedUsersFilters,
  setSelectedAssignedUsersFilters,
  showFinishedTasks,
  setShowFinishedTasks,
  selectedCustomDueDate,
  setSelectedCustomDueDate,
}) => {
  const { t } = useTranslation();
  // --- FIX 2: Initialize state with `undefined`
  const [isDueDateOpen, setIsDueDateOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isAssignedUsersOpen, setIsAssignedUsersOpen] = useState(false);
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);

  const totalActiveFilters = useMemo(() => {
    return (
      selectedPlannedEndDateFilters.length +
      selectedPriorityFilters.length +
      selectedStatusFilters.length +
      selectedAssignedUsersFilters.length +
      (searchTerm ? 1 : 0)
    );
  }, [
    selectedPlannedEndDateFilters,
    selectedPriorityFilters,
    selectedStatusFilters,
    selectedAssignedUsersFilters,
    searchTerm,
    selectedCustomDueDate,
  ]);

  const handleToggleFilter = (
    filterValue: string,
    setSelectedFilters: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setSelectedFilters((prev) =>
      prev.includes(filterValue)
        ? prev.filter((item) => item !== filterValue)
        : [...prev, filterValue]
    );
    if (filterValue !== "Custom Date" && selectedCustomDueDate) {
      setSelectedCustomDueDate(undefined);
    }
  };

  const handleToggleAssignedUserFilter = (userId: string) => {
    setSelectedAssignedUsersFilters((prev) =>
      prev.includes(userId)
        ? prev.filter((item) => item !== userId)
        : [...prev, userId]
    );
  };

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setSelectedPlannedEndDateFilters([]);
    setSelectedPriorityFilters([]);
    setSelectedStatusFilters([]);
    setSelectedAssignedUsersFilters([]);
    setSelectedCustomDueDate(undefined);
  };

  return (
    <div className="flex flex-wrap items-center justify-start gap-4 p-4 w-full">
      {/* Search Field - Replaced with Shadcn Input */}
      <div className="relative w-[200px]">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          type="search"
          placeholder={t("Search for")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {totalActiveFilters > 0 && (
        <Button variant="outline" onClick={handleClearAllFilters}>
          {t("Clear Filters")}
        </Button>
      )}

      {/* Avatars for Assignee Filter - Replaced with Shadcn Avatar & Tooltip */}
      <TooltipProvider>
        <div className="flex -space-x-2">
          {allUserOptions.map((user) => (
            <Tooltip key={user.user_id}>
              <TooltipTrigger asChild>
                <div
                  onClick={() => handleToggleAssignedUserFilter(user.user_id)}
                >
                  <Avatar
                    className={cn(
                      "h-8 w-8 cursor-pointer ring-2 ring-white transition-all hover:z-10",
                      selectedAssignedUsersFilters.includes(user.user_id) &&
                        "ring-blue-500"
                    )}
                  >
                    <AvatarImage
                      src={user.profile_picture_url || undefined}
                      alt={user.user_name}
                    />
                    <AvatarFallback>
                      {getInitials(user.user_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.user_name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      {/* Main Filter Button - Replaced with Shadcn Popover & Button */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "flex items-center gap-1 min-w-[120px]",
              totalActiveFilters > 0 &&
                "border-blue-500 text-blue-500 hover:text-blue-600"
            )}
          >
            <Filter size={16} />
            <span className="text-sm">{t("Filters")}</span>
            {totalActiveFilters > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs font-semibold text-white bg-blue-500 rounded-full">
                {totalActiveFilters}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2">
          {/* Nested Dropdown Menus */}
          <DropdownMenu onOpenChange={setIsDueDateOpen} open={isDueDateOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-between pr-2">
                {t("Deadline")}
                <ChevronRight size={16} className="text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start">
              {dueDateFilterOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onSelect={() => {
                    if (option.value === "Custom Date") {
                      setIsCustomDateOpen(true);
                    } else {
                      // --- FIX 5: Use `undefined` instead of `null`
                      setSelectedCustomDueDate(undefined);
                      handleToggleFilter(
                        option.value,
                        setSelectedPlannedEndDateFilters
                      );
                    }
                  }}
                  className="cursor-pointer"
                >
                  <span className="mr-2">
                    {getDueDateIndicator(option.value).icon}
                  </span>
                  <span>{t(option.labelKey)}</span>
                  {(selectedPlannedEndDateFilters.includes(option.value) ||
                    (option.value === "Custom Date" &&
                      selectedCustomDueDate)) && (
                    <Check size={16} className="ml-auto text-blue-500" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenuSeparator />

          <DropdownMenu onOpenChange={setIsPriorityOpen} open={isPriorityOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-between pr-2">
                {t("Priority")}
                <ChevronRight size={16} className="text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start">
              {KAN_TASK_PRIORITY_OPTIONS.map((filter) => (
                <DropdownMenuItem
                  key={filter.value}
                  onSelect={() =>
                    handleToggleFilter(
                      filter.description,
                      setSelectedPriorityFilters
                    )
                  }
                  className="cursor-pointer"
                >
                  <span className="mr-2">
                    <Circle
                      size={12}
                      className={getPriorityIndicator(filter.description).color}
                    />
                  </span>
                  <span>{t(filter.description)}</span>
                  {selectedPriorityFilters.includes(filter.description) && (
                    <Check size={16} className="ml-auto text-blue-500" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenuSeparator />

          <DropdownMenu onOpenChange={setIsStatusOpen} open={isStatusOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-between pr-2">
                {t("Status")}
                <ChevronRight size={16} className="text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start">
              {["Planned", "In Progress", "Finished"].map((filter) => (
                <DropdownMenuItem
                  key={filter}
                  onSelect={() =>
                    handleToggleFilter(filter, setSelectedStatusFilters)
                  }
                  className="cursor-pointer"
                >
                  <span className="mr-2">
                    {getStatusIndicator(filter).icon}
                  </span>
                  <span>{t(filter)}</span>
                  {selectedStatusFilters.includes(filter) && (
                    <Check size={16} className="ml-auto text-blue-500" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenuSeparator />

          <DropdownMenu
            onOpenChange={setIsAssignedUsersOpen}
            open={isAssignedUsersOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-between pr-2">
                {t("Assignee")}
                <ChevronRight size={16} className="text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start">
              {allUserOptions.length > 0 ? (
                allUserOptions.map((user) => (
                  <DropdownMenuItem
                    key={user.user_id}
                    onSelect={() =>
                      handleToggleAssignedUserFilter(user.user_id)
                    }
                    className="cursor-pointer"
                  >
                    <User size={16} className="mr-2" />
                    <span>{user.user_name}</span>
                    {selectedAssignedUsersFilters.includes(user.user_id) && (
                      <Check size={16} className="ml-auto text-blue-500" />
                    )}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  <span>{t("No users available")}</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </PopoverContent>
      </Popover>

      {selectedCustomDueDate && (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
          {t("Custom Date")}: {formatDateAndTime(selectedCustomDueDate, "date")}
          <button
            onClick={() => {
              setSelectedCustomDueDate(undefined);
              setSelectedPlannedEndDateFilters([]);
            }}
            className="p-1 rounded-full hover:bg-blue-200"
          >
            <XCircle size={16} />
          </button>
        </span>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="showCompletedTasks"
          checked={showFinishedTasks}
          onCheckedChange={(checked) => {
            if (typeof checked === "boolean") {
              setShowFinishedTasks(checked);
            }
          }}
        />
        <label
          htmlFor="showCompletedTasks"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {t("Show Finished Tasks")}
        </label>
      </div>
      <Popover open={isCustomDateOpen} onOpenChange={setIsCustomDateOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedCustomDueDate && "text-muted-foreground"
            )}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            {selectedCustomDueDate ? (
              format(selectedCustomDueDate, "PPP")
            ) : (
              <span>{t("Pick a date")}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedCustomDueDate}
            onSelect={setSelectedCustomDueDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default KanbanFilters;
