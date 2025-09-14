import React, { useState, useCallback, useRef, useEffect } from "react";
import { Circle, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import {
  NewFormData,
  UserPossibleAssignes,
} from "@/components/InteractiveKanbanBoard/KanbanboardUtils";
import { getPriorityIndicator } from "@/Global/Utils/statusIndicator";
import AssigneeSelector from "./AssigneeSelector";

interface NewTaskFormProps {
  onSubmit: (data: NewFormData) => void;
  onCancel: () => void;
  allUserOptions: UserPossibleAssignes[];
}

const NewTaskForm: React.FC<NewTaskFormProps> = ({
  onSubmit,
  onCancel,
  allUserOptions,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<NewFormData>({
    title: "",
    planned_end_date: null,
    priority: "Medium",
    assignees: [],
  });
  const [priorityAnchorEl, setPriorityAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const openPriorityMenu = Boolean(priorityAnchorEl);

  const [assigneeAnchorEl, setAssigneeAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const openAssigneeMenu = Boolean(assigneeAnchorEl);

  // Replaced ClickAwayListener with a ref and useEffect
  const formRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        onCancel();
        setFormData({
          title: "",
          planned_end_date: null,
          priority: "Medium",
          assignees: [],
        });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onCancel]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleDateChange = useCallback((newValue: Date | null) => {
    let formattedDate: string | null = null;
    if (newValue instanceof Date && !isNaN(newValue.getTime())) {
      formattedDate = newValue.toISOString().split("T")[0];
    }
    setFormData((prev) => ({
      ...prev,
      planned_end_date: formattedDate,
    }));
  }, []);

  const handlePriorityClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setPriorityAnchorEl(event.currentTarget);
    },
    []
  );

  const handlePrioritySelect = useCallback(
    (priority: "Low" | "Medium" | "High" | "Critical") => {
      setFormData((prev) => ({ ...prev, priority }));
      setPriorityAnchorEl(null);
    },
    []
  );

  const handleSubmit = useCallback(() => {
    onSubmit(formData);
    setFormData({
      title: "",
      planned_end_date: null,
      priority: "Medium",
      assignees: [],
    });
  }, [formData, onSubmit]);

  const handleAssigneeClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAssigneeAnchorEl(event.currentTarget);
    },
    []
  );

  const handleAssigneeClose = useCallback(() => {
    setAssigneeAnchorEl(null);
  }, []);

  const handleAssignUser = useCallback(
    (userId: string) => {
      const userToAssign = allUserOptions.find(
        (user) => user.user_id === userId
      );
      if (
        userToAssign &&
        !formData.assignees?.some((u) => u.user_id === userId)
      ) {
        setFormData((prev) => ({
          ...prev,
          assignees: [...(prev.assignees || []), userToAssign],
        }));
      }
    },
    [allUserOptions, formData.assignees]
  );

  const handleUnassignUser = useCallback((userId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignees: (prev.assignees || []).filter(
        (user) => user.user_id !== userId
      ),
    }));
  }, []);

  return (
    <div
      ref={formRef} // Attach the ref here
      className="
        p-4 rounded-lg shadow-md bg-white dark:bg-zinc-800
        flex flex-col space-y-4
      "
    >
      <div className="flex items-center gap-2">
        <div className="relative group">
          <button
            onClick={handlePriorityClick}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <Circle
              size={16}
              style={{
                color:
                  formData.priority &&
                  getPriorityIndicator(formData.priority).color,
              }}
            />
          </button>
          <span className="tooltip hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-700 text-white text-xs rounded py-1 px-2">
            {t("Select Priority")}
          </span>
          {openPriorityMenu && (
            <div
              className="
                absolute z-50 mt-2 w-40 rounded-md shadow-lg
                bg-white dark:bg-zinc-900 ring-1 ring-black ring-opacity-5
              "
              style={{
                top: priorityAnchorEl
                  ? priorityAnchorEl.offsetTop + priorityAnchorEl.offsetHeight
                  : 0,
                left: priorityAnchorEl ? priorityAnchorEl.offsetLeft : 0,
              }}
            >
              {["Low", "Medium", "High", "Critical"].map((priority) => (
                <div
                  key={priority}
                  onClick={() =>
                    handlePrioritySelect(
                      priority as "Low" | "Medium" | "High" | "Critical"
                    )
                  }
                  className="
                    flex items-center gap-2 p-2 cursor-pointer
                    hover:bg-gray-100 dark:hover:bg-zinc-800
                  "
                >
                  <Circle
                    size={12}
                    style={{
                      color: getPriorityIndicator(priority).color,
                    }}
                  />
                  <p className="text-sm">{t(priority)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <input
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          autoFocus
          className="
            w-full py-2 border-b border-gray-300 dark:border-zinc-700
            focus:outline-none focus:border-blue-500
            bg-transparent text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-zinc-500
          "
          placeholder={t("Enter a task name * (required)")}
        />
      </div>

      {/* This is a placeholder for a DatePicker component. */}
      <div className="flex items-center gap-2">
        {/* <DatePicker
          label={t("Set End Date")}
          value={formData.planned_end_date ? new Date(formData.planned_end_date) : null}
          onChange={handleDateChange}
        /> */}
      </div>

      <div className="flex items-center gap-2 justify-end">
        <div
          className={cn(
            "flex -space-x-2 overflow-hidden",
            formData.assignees &&
              formData.assignees.length > 0 &&
              "flex-grow justify-end"
          )}
        >
          {formData.assignees?.map((user) => (
            <span key={user.user_id} className="relative group">
              <div className="tooltip hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                {user.user_name}
              </div>
              <div
                className="
                  w-6 h-6 rounded-full border-2 border-white dark:border-zinc-800
                  flex items-center justify-center text-xs font-semibold bg-gray-500 text-white
                  cursor-pointer
                "
              >
                <img
                  src={user.profile_picture_url || undefined}
                  alt={user.user_name}
                  className="w-full h-full object-cover rounded-full"
                  // onError={(e) => {
                  //   e.currentTarget.style.display = "none";
                  //   e.currentTarget.parentNode?.textContent = getInitials(
                  //     user.user_name
                  //   );
                  // }}
                />
              </div>
            </span>
          ))}
        </div>
        <div className="relative group">
          <button
            aria-label="assign task"
            onClick={handleAssigneeClick}
            className="
              p-2 rounded-full bg-gray-200 dark:bg-zinc-700
              hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors
            "
          >
            <UserPlus size={16} />
          </button>
          <span className="tooltip hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            {t("Assign Task")}
          </span>
          {openAssigneeMenu && (
            <div
              className="
                absolute z-50 mt-2 p-2 w-96 rounded-md shadow-lg
                bg-white dark:bg-zinc-900 ring-1 ring-black ring-opacity-5
              "
              style={{
                top: assigneeAnchorEl
                  ? assigneeAnchorEl.offsetTop + assigneeAnchorEl.offsetHeight
                  : 0,
                left: assigneeAnchorEl ? assigneeAnchorEl.offsetLeft : 0,
              }}
            >
              <AssigneeSelector
                allUserOptions={allUserOptions}
                assignedUsers={formData.assignees || []}
                onAssignUser={handleAssignUser}
                onUnassignUser={handleUnassignUser}
                canEdit={true}
              />
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="
          w-full px-4 py-2 mt-2 font-semibold text-white rounded-md
          bg-blue-600 hover:bg-blue-700 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
        "
        disabled={!formData.title || !formData.title.trim()}
      >
        {t("Add Task")}
      </button>
    </div>
  );
};

export default NewTaskForm;
