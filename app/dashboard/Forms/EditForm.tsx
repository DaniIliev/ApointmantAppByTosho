import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Appointment, AppointmentStatus } from "@/Global/Types/types";
import React from "react";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";
import { FormGrid } from "@/Global/Styles/FormGrid";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { LabeledTextarea } from "@/components/customUIComponents/LabeledTextarea";

interface ViewDetailsProps {
  handleSaveEdit: () => void;
  editingAppointment: Appointment;
  setEditingAppointment: React.Dispatch<
    React.SetStateAction<Appointment | null>
  >;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const LabeledStatusSelect = ({
  value,
  onValueChange,
}: {
  value: AppointmentStatus;
  onValueChange: (value: AppointmentStatus) => void;
}) => {
  const { t } = useTranslation();
  const statuses: AppointmentStatus[] = ["upcoming", "completed", "cancelled"];

  return (
    <LabeledSelect
      label={t("Status")}
      id="editStatus"
      value={value}
      onValueChange={onValueChange}
      placeholder={t("Select status")}
      options={statuses.map((s) => ({
        id: s,
        name: t(s),
      }))}
    />
  );
};

const EditForm = ({
  handleSaveEdit,
  editingAppointment,
  setEditingAppointment,
  setIsEditMode,
}: ViewDetailsProps) => {
  const { t } = useTranslation();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setEditingAppointment((prev) => (prev ? { ...prev, [id]: value } : null));
  };

  const handleSelectChange = (value: AppointmentStatus) => {
    setEditingAppointment((prev) => (prev ? { ...prev, status: value } : null));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEditingAppointment((prev) => (prev ? { ...prev, [id]: value } : null));
  };

  return (
    <>
      <div className="space-y-6">
        <FormGrid>
          <LabeledInput
            label={t("Client Name")}
            id="clientName"
            value={editingAppointment.clientName}
            onChange={handleInputChange}
          />
          <LabeledInput
            label={t("Email")}
            id="clientEmail"
            type="email"
            value={editingAppointment.clientEmail}
            onChange={handleInputChange}
          />
          <LabeledInput
            label={t("Phone")}
            id="clientPhone"
            value={editingAppointment.clientPhone}
            onChange={handleInputChange}
          />
          <LabeledInput
            label={t("Service")}
            id="service"
            value={editingAppointment.serviceName}
            onChange={handleInputChange}
          />
          <LabeledInput
            label={t("Date")}
            id="date"
            type="date"
            value={editingAppointment.appointmentTime.start}
            onChange={handleInputChange}
          />
          <LabeledInput
            label={t("Time")}
            id="time"
            type="time"
            value={editingAppointment.appointmentTime.start}
            onChange={handleInputChange}
          />
        </FormGrid>

        <LabeledStatusSelect
          value={editingAppointment.status}
          onValueChange={handleSelectChange}
        />

        <LabeledTextarea
          label={t("Notes")}
          id="notes"
          value={editingAppointment.notes || ""}
          onChange={handleTextareaChange}
          placeholder={t("Add any additional notes...")}
        />

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setIsEditMode(false);
              setEditingAppointment(null);
            }}
            className="flex-1 rounded-xl bg-transparent"
          >
            {t("Cancel")}
          </Button>
          <Button
            onClick={handleSaveEdit}
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-xl"
          >
            {t("Save Changes")}
          </Button>
        </div>
      </div>
    </>
  );
};

export default EditForm;
