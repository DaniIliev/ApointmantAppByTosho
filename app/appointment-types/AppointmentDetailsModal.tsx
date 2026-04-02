// components/AppointmentDetailsModal.tsx
import React from "react";
import { Modal } from "@/components/customUIComponents/Modal";
import { Clock, Euro, Tag } from "lucide-react";
import { formatPriceEUR } from "@/Global/Utils/commonFn";
import { AppointmentType } from "@/Global/Types/types";
import { useTranslation } from "react-i18next";

type AppointmentDetailsModalProps = {
  selectedType: AppointmentType | null;
  setSelectedType: (type: AppointmentType | null) => void;
  formatDuration: (minutes: number) => string;
};

const AppointmentDetailsModal = ({
  selectedType,
  setSelectedType,
  formatDuration,
}: AppointmentDetailsModalProps) => {
  const { t } = useTranslation();
  if (!selectedType) return null;

  return (
    <Modal
      open={!!selectedType}
      onOpenChange={() => setSelectedType(null)}
      label={selectedType.name}
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4">
          {selectedType.imageUrl && (
            <div className="w-50 h-50 flex-shrink-0">
              <img
                src={selectedType.imageUrl}
                alt={selectedType.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{t("Duration")}:</span>{" "}
              {formatDuration(selectedType.duration)}
            </div>
            <div className="flex items-center gap-2 text-lg font-bold text-primary">
              <Euro className="h-4 w-4" />
              <span className="font-medium">{t("Price")}:</span>{" "}
              {formatPriceEUR(selectedType.price)}
            </div>
            {selectedType.isGroup && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span className="font-medium">{t("Capacity")}:</span>{" "}
                {selectedType.capacity} {t("participants")}
              </div>
            )}
          </div>
        </div>

        <p className="text-lg text-muted-foreground">
          {selectedType.description}
        </p>
      </div>
    </Modal>
  );
};

export default AppointmentDetailsModal;
