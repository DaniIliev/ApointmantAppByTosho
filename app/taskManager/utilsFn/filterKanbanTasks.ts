import {
  isSameDay,
  isSameWeek,
  isBefore,
  isAfter,
  isToday,
  isTomorrow,
  startOfWeek,
} from "date-fns";

interface FilterOptions {
  searchTerm: string;
  selectedPlannedEndDateFilters: string[];
  selectedPriorityFilters: string[];
  selectedStatusFilters: string[];
  selectedAssignedUsersFilters: string[];
  showFinishedTasks: boolean;
  selectedCustomDueDate: Date | undefined; // Changed from `Date | null` to `Date | undefined`
}

// Helper function to normalize dates for accurate comparison
const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export const filterKanbanTasks = (
  tasks: any[] | undefined,
  options: FilterOptions
): any[] => {
  let currentTasks = tasks || [];
  const {
    searchTerm,
    selectedPlannedEndDateFilters,
    selectedPriorityFilters,
    selectedStatusFilters,
    selectedAssignedUsersFilters,
    showFinishedTasks,
    selectedCustomDueDate,
  } = options;

  const now = normalizeDate(new Date());

  // 1. Filter out finished tasks if option is not checked
  if (!showFinishedTasks) {
    currentTasks = currentTasks.filter((task) => task.status !== "Finished");
  }

  // 2. Filter by search term (case-insensitive)
  if (searchTerm) {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    currentTasks = currentTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        task.description?.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }

  // 3. Filter by planned end date and custom date
  if (selectedPlannedEndDateFilters.length > 0 || selectedCustomDueDate) {
    const normalizedCustomDueDate = selectedCustomDueDate
      ? normalizeDate(selectedCustomDueDate)
      : undefined;

    currentTasks = currentTasks.filter((task) => {
      const hasPlannedEndDate =
        task.planned_end_date !== undefined && task.planned_end_date !== null;
      const plannedDate = hasPlannedEndDate
        ? normalizeDate(new Date(task.planned_end_date!))
        : undefined;

      // Handle custom date first for exact matches
      if (normalizedCustomDueDate) {
        return plannedDate && isSameDay(plannedDate, normalizedCustomDueDate);
      }

      // Handle "No date" filter
      if (selectedPlannedEndDateFilters.includes("No date")) {
        return !hasPlannedEndDate;
      }

      // Handle other date filters
      return selectedPlannedEndDateFilters.some((filter) => {
        if (!plannedDate) return false;

        switch (filter) {
          case "Late":
            return isBefore(plannedDate, now);
          case "Today":
            return isToday(plannedDate);
          case "Tomorrow":
            return isTomorrow(plannedDate);
          case "This Week":
            return isSameWeek(plannedDate, now);
          case "Next Week":
            const nextWeekStart = startOfWeek(
              new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7)
            );
            return isSameWeek(plannedDate, nextWeekStart);
          case "Future":
            return isAfter(plannedDate, now);
          default:
            return false;
        }
      });
    });
  }

  // 4. Filter by assigned users
  if (selectedAssignedUsersFilters.length > 0) {
    currentTasks = currentTasks.filter((task) => {
      // Check if "no-assigned-user" filter is selected and the task has no assignees
      const hasNoAssignee = !task.assignees || task.assignees.length === 0;
      if (
        selectedAssignedUsersFilters.includes("no-assigned-user") &&
        hasNoAssignee
      ) {
        return true;
      }

      // Check if any of the task's assignees are in the filter list
      return task.assignees.some((user: any) =>
        selectedAssignedUsersFilters.includes(user.user_id)
      );
    });
  }

  // 5. Filter by priority
  if (selectedPriorityFilters.length > 0) {
    currentTasks = currentTasks.filter(
      (task) => task.priority && selectedPriorityFilters.includes(task.priority)
    );
  }

  // 6. Filter by status
  if (selectedStatusFilters.length > 0) {
    currentTasks = currentTasks.filter(
      (task) => task.status && selectedStatusFilters.includes(task.status)
    );
  }

  // 7. Sort the tasks
  currentTasks.sort((a, b) => {
    // Finished tasks at the bottom
    const statusA = a.status === "Finished" ? 1 : -1;
    const statusB = b.status === "Finished" ? 1 : -1;
    if (statusA !== statusB) return statusA - statusB;

    // Normal order sorting
    return (a.order || 0) - (b.order || 0);
  });

  return currentTasks;
};
