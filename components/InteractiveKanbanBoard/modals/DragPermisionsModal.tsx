import React from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

type DroppedTaskModal = {
  showModal: boolean;
  message?: string;
  allowedToDrop: boolean;
  droppedTaskID: string;
  droppedColumnID: string;
  isSameColumn: boolean;
  overElementId?: string;
} | null;

interface DragPermissionModalProps {
  dropTaskModal: DroppedTaskModal;
  onClose: () => void;
}

const DragPermissionModal: React.FC<DragPermissionModalProps> = ({
  dropTaskModal,
  onClose,
}) => {
  const { t } = useTranslation();
  const showModal = dropTaskModal?.showModal && !dropTaskModal.allowedToDrop;

  if (!showModal) {
    return null;
  }

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-black bg-opacity-50 transition-opacity duration-300
      `}
    >
      <div
        className="
          relative w-full max-w-sm p-8 bg-white dark:bg-zinc-800 rounded-lg
          shadow-lg transform transition-all duration-300
        "
      >
        <div className="text-center">
          <div className="flex flex-row items-center justify-center space-x-2 mb-4">
            <h4 className="text-xl font-normal text-gray-900 dark:text-gray-100">
              {dropTaskModal?.message ||
                t("You do not have permission to perform this action.")}
            </h4>
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          <button
            onClick={onClose}
            className="
              mt-6 px-6 py-2 rounded-md font-semibold text-white bg-blue-600
              hover:bg-blue-700 transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          >
            {t("Ok")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DragPermissionModal;
