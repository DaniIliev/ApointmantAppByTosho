import React, { useState, useMemo } from "react";
import { Search, UserPlus, UserMinus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { UserPossibleAssignee } from "@/components/InteractiveKanbanBoard/KanbanboardUtils";

interface AssigneeSelectorProps {
  allUserOptions: UserPossibleAssignee[];
  assignedUsers: UserPossibleAssignee[];
  onAssignUser: (userId: string) => void;
  onUnassignUser: (userId: string) => void;
  canEdit: boolean;
}

const AssigneeSelector: React.FC<AssigneeSelectorProps> = ({
  allUserOptions,
  assignedUsers,
  onAssignUser,
  onUnassignUser,
  canEdit,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAvailableUsers = useMemo(() => {
    const assignedIds = new Set(assignedUsers.map((u) => u.user_id));
    return allUserOptions
      .filter((user) => !assignedIds.has(user.user_id))
      .filter((user) =>
        user.user_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [allUserOptions, assignedUsers, searchTerm]);

  const filteredAssignedUsers = useMemo(() => {
    return assignedUsers.filter((user) =>
      user.user_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [assignedUsers, searchTerm]);

  const handleAssignClick = (userId: string) => {
    if (canEdit) {
      onAssignUser(userId);
    }
  };

  const handleUnassignClick = (userId: string) => {
    if (canEdit) {
      onUnassignUser(userId);
    }
  };

  const UserList = ({
    users,
    isAssigned,
  }: {
    users: UserPossibleAssignee[];
    isAssigned: boolean;
  }) => (
    <ul className="max-h-80 overflow-y-auto space-y-2">
      {users.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isAssigned ? t("No assigned users.") : t("No users found.")}
        </p>
      ) : (
        users.map((user) => (
          <li
            key={user.user_id}
            className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <span className="text-sm text-gray-900 dark:text-gray-100">
              {user.user_name}
            </span>
            {canEdit && (
              <button
                type="button"
                onClick={() =>
                  isAssigned
                    ? handleUnassignClick(user.user_id)
                    : handleAssignClick(user.user_id)
                }
                className="p-1 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700"
              >
                {isAssigned ? <UserMinus size={16} /> : <UserPlus size={16} />}
              </button>
            )}
          </li>
        ))
      )}
    </ul>
  );

  return (
    <div className="w-full">
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          className="
            w-full py-2 pl-10 pr-4 rounded-md border border-gray-300 dark:border-zinc-700
            bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
          placeholder={t("Search users...")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 w-full">
        <div className="flex-1 p-4 min-w-64">
          <h4 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t("Available Users")}
            <div className="flex justify-center items-center border border-gray-400 dark:border-zinc-600 rounded-full px-2 py-1">
              <span className="text-sm">{filteredAvailableUsers?.length}</span>
            </div>
          </h4>
          <UserList users={filteredAvailableUsers} isAssigned={false} />
        </div>
        <div className="md:border-l border-gray-300 dark:border-zinc-700 my-4 md:my-0"></div>

        <div className="flex-1 p-4 min-w-64">
          <h4 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t("Assigned Users")}
            <div className="flex justify-center items-center border border-gray-400 dark:border-zinc-600 rounded-full px-2 py-1">
              <span className="text-sm">{filteredAssignedUsers?.length}</span>
            </div>
          </h4>
          <UserList users={filteredAssignedUsers} isAssigned={true} />
        </div>
      </div>
    </div>
  );
};

export default AssigneeSelector;
