import React, { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface NewColumnCreatorProps {
  canAdd: boolean;
  onCreateColumn: (columnName: string) => void;
}

const NewColumnCreator: React.FC<NewColumnCreatorProps> = ({
  canAdd,
  onCreateColumn,
}) => {
  const { t } = useTranslation();
  const [showNewColumnInput, setShowNewColumnInput] = useState<boolean>(false);
  const [newColumnName, setNewColumnName] = useState<string>("");

  const handleCreateColumn = useCallback(() => {
    if (newColumnName.trim()) {
      onCreateColumn(newColumnName.trim());
      setNewColumnName("");
      setShowNewColumnInput(false);
    } else {
      setShowNewColumnInput(false);
    }
  }, [newColumnName, onCreateColumn]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleCreateColumn();
      }
    },
    [handleCreateColumn]
  );

  const handleBlur = useCallback(() => {
    if (newColumnName.trim()) {
      handleCreateColumn();
    } else {
      setShowNewColumnInput(false);
    }
  }, [newColumnName, handleCreateColumn]);

  return (
    <>
      {showNewColumnInput ? (
        <input
          autoFocus
          type="text"
          value={newColumnName}
          onChange={(e) => setNewColumnName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={t("Column name...")}
          className="
            w-0 min-w-[300px] h-max p-4
            bg-gray-100 dark:bg-zinc-800
            rounded-lg
            border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          disabled={!canAdd}
        />
      ) : (
        <button
          onClick={() => setShowNewColumnInput(true)}
          className="
            h-max w-12 p-3
            flex items-center justify-center
            border border-gray-400 dark:border-zinc-600 border-dashed rounded-md
            text-gray-600 dark:text-gray-400
            hover:border-gray-600 dark:hover:border-zinc-400
            hover:text-gray-800 dark:hover:text-gray-200
            transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          disabled={!canAdd}
        >
          <Plus size={24} />
        </button>
      )}
    </>
  );
};

export default NewColumnCreator;
