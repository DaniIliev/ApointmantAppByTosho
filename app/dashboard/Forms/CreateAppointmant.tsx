import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { AppointmentType } from "@/Global/Types/types";
import React from "react";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";
import { LabeledTextarea } from "@/components/customUIComponents/LabeledTextarea";
import { FormGrid } from "@/Global/Styles/FormGrid";

interface CreateAppointmantProps {
  newAppointment: {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    date: string;
    time: string;
    appointmentTypeId: string;
    notes: string;
  };
  setNewAppointment: React.Dispatch<
    React.SetStateAction<{
      clientName: string;
      clientEmail: string;
      clientPhone: string;
      date: string;
      time: string;
      appointmentTypeId: string;
      notes: string;
    }>
  >;
  mockAppointmentTypes: AppointmentType[];
  handleCreateAppointment: () => void;
  setIsCreateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateAppointmant = ({
  newAppointment,
  setNewAppointment,
  handleCreateAppointment,
  mockAppointmentTypes,
  setIsCreateModalOpen,
}: CreateAppointmantProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <FormGrid>
        <LabeledInput
          label={t("Client Name")}
          id="clientName"
          value={newAppointment.clientName}
          onChange={(e) =>
            setNewAppointment((prev) => ({
              ...prev,
              clientName: e.target.value,
            }))
          }
          placeholder={t("Enter client name")}
        />

        <LabeledInput
          label={t("Email")}
          id="clientEmail"
          type="email"
          value={newAppointment.clientEmail}
          onChange={(e) =>
            setNewAppointment((prev) => ({
              ...prev,
              clientEmail: e.target.value,
            }))
          }
          placeholder={t("client@example.com")}
        />

        <LabeledInput
          label={t("Phone")}
          id="clientPhone"
          value={newAppointment.clientPhone}
          onChange={(e) =>
            setNewAppointment((prev) => ({
              ...prev,
              clientPhone: e.target.value,
            }))
          }
          placeholder={t("+1 (555) 123-4567")}
        />

        <LabeledSelect
          label={t("Appointment Type")}
          id="appointmentType"
          value={newAppointment.appointmentTypeId}
          onValueChange={(value) =>
            setNewAppointment((prev) => ({ ...prev, appointmentTypeId: value }))
          }
          placeholder={t("Select appointment type")}
          options={mockAppointmentTypes}
        />

        <LabeledInput
          label={t("Date")}
          id="date"
          type="date"
          value={newAppointment.date}
          onChange={(e) =>
            setNewAppointment((prev) => ({ ...prev, date: e.target.value }))
          }
        />

        <LabeledInput
          label={t("Time")}
          id="time"
          type="time"
          value={newAppointment.time}
          onChange={(e) =>
            setNewAppointment((prev) => ({ ...prev, time: e.target.value }))
          }
        />
      </FormGrid>

      <LabeledTextarea
        label={t("Notes (Optional)")}
        id="notes"
        value={newAppointment.notes}
        onChange={(e) =>
          setNewAppointment((prev) => ({ ...prev, notes: e.target.value }))
        }
        placeholder={t("Add any additional notes or special requirements...")}
      />

      {newAppointment.appointmentTypeId && (
        <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
          {(() => {
            const selectedType = mockAppointmentTypes.find(
              (type) => type.id === newAppointment.appointmentTypeId
            );
            return selectedType ? (
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">
                  {t("Selected Service")}
                </h4>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{selectedType.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedType.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${selectedType.price}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedType.duration} {t("minutes")}
                    </p>
                  </div>
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => setIsCreateModalOpen(false)}
          className="flex-1 rounded-xl bg-transparent"
        >
          {t("Cancel")}
        </Button>
        <Button
          onClick={handleCreateAppointment}
          disabled={
            !newAppointment.clientName ||
            !newAppointment.clientEmail ||
            !newAppointment.date ||
            !newAppointment.time ||
            !newAppointment.appointmentTypeId
          }
          className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-xl"
        >
          {t("Create Appointment")}
        </Button>
      </div>
    </div>
  );
};

export default CreateAppointmant;
