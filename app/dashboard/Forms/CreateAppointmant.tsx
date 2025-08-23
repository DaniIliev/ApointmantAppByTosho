import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AppointmentType } from "@/Global/Types/types";
import React from "react";

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientName" className="text-sm font-medium">
            {t("Client Name")}
          </Label>
          <Input
            id="clientName"
            value={newAppointment.clientName}
            onChange={(e) =>
              setNewAppointment((prev) => ({
                ...prev,
                clientName: e.target.value,
              }))
            }
            className="h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
            placeholder={t("Enter client name")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientEmail" className="text-sm font-medium">
            {t("Email")}
          </Label>
          <Input
            id="clientEmail"
            type="email"
            value={newAppointment.clientEmail}
            onChange={(e) =>
              setNewAppointment((prev) => ({
                ...prev,
                clientEmail: e.target.value,
              }))
            }
            className="h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
            placeholder={t("client@example.com")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientPhone" className="text-sm font-medium">
            {t("Phone")}
          </Label>
          <Input
            id="clientPhone"
            value={newAppointment.clientPhone}
            onChange={(e) =>
              setNewAppointment((prev) => ({
                ...prev,
                clientPhone: e.target.value,
              }))
            }
            className="h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
            placeholder={t("+1 (555) 123-4567")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="appointmentType" className="text-sm font-medium">
            {t("Appointment Type")}
          </Label>
          <Select
            value={newAppointment.appointmentTypeId}
            onValueChange={(value) =>
              setNewAppointment((prev) => ({
                ...prev,
                appointmentTypeId: value,
              }))
            }
          >
            <SelectTrigger className="h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl">
              <SelectValue placeholder={t("Select appointment type")} />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-lg border-2 border-primary/20">
              {mockAppointmentTypes.map((type) => (
                <SelectItem
                  key={type.id}
                  value={type.id}
                  className="focus:bg-primary/10"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{type.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {type.duration} {t("min")} - ${type.price}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date" className="text-sm font-medium">
            {t("Date")}
          </Label>
          <Input
            id="date"
            type="date"
            value={newAppointment.date}
            onChange={(e) =>
              setNewAppointment((prev) => ({
                ...prev,
                date: e.target.value,
              }))
            }
            className="h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time" className="text-sm font-medium">
            {t("Time")}
          </Label>
          <Input
            id="time"
            type="time"
            value={newAppointment.time}
            onChange={(e) =>
              setNewAppointment((prev) => ({
                ...prev,
                time: e.target.value,
              }))
            }
            className="h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium">
          {t("Notes (Optional)")}
        </Label>
        <Textarea
          id="notes"
          value={newAppointment.notes}
          onChange={(e) =>
            setNewAppointment((prev) => ({
              ...prev,
              notes: e.target.value,
            }))
          }
          className="min-h-[100px] border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl resize-none"
          placeholder={t("Add any additional notes or special requirements...")}
        />
      </div>

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
