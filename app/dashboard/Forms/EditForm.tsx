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
import { Appointment, AppointmentStatus } from "@/Global/Types/types";
import React from "react";

interface ViewDetailsProps {
  handleSaveEdit: () => void;
  editingAppointment: Appointment;
  setEditingAppointment: React.Dispatch<
    React.SetStateAction<Appointment | null>
  >;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditForm = ({
  handleSaveEdit,
  editingAppointment,
  setEditingAppointment,
  setIsEditMode,
}: ViewDetailsProps) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="editClientName" className="text-sm font-medium">
              {t("Client Name")}
            </Label>
            <Input
              id="editClientName"
              value={editingAppointment.clientName}
              onChange={(e) =>
                setEditingAppointment((prev) =>
                  prev ? { ...prev, clientName: e.target.value } : null
                )
              }
              className="h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editClientEmail" className="text-sm font-medium">
              {t("Email")}
            </Label>
            <Input
              id="editClientEmail"
              type="email"
              value={editingAppointment.clientEmail}
              onChange={(e) =>
                setEditingAppointment((prev) =>
                  prev ? { ...prev, clientEmail: e.target.value } : null
                )
              }
              className="h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editClientPhone" className="text-sm font-medium">
              {t("Phone")}
            </Label>
            <Input
              id="editClientPhone"
              value={editingAppointment.clientPhone}
              onChange={(e) =>
                setEditingAppointment((prev) =>
                  prev ? { ...prev, clientPhone: e.target.value } : null
                )
              }
              className="h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editService" className="text-sm font-medium">
              {t("Service")}
            </Label>
            <Input
              id="editService"
              value={editingAppointment.service}
              onChange={(e) =>
                setEditingAppointment((prev) =>
                  prev ? { ...prev, service: e.target.value } : null
                )
              }
              className="h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editDate" className="text-sm font-medium">
              {t("Date")}
            </Label>
            <Input
              id="editDate"
              type="date"
              value={editingAppointment.date}
              onChange={(e) =>
                setEditingAppointment((prev) =>
                  prev ? { ...prev, date: e.target.value } : null
                )
              }
              className="h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editTime" className="text-sm font-medium">
              {t("Time")}
            </Label>
            <Input
              id="editTime"
              type="time"
              value={editingAppointment.time}
              onChange={(e) =>
                setEditingAppointment((prev) =>
                  prev ? { ...prev, time: e.target.value } : null
                )
              }
              className="h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="editStatus" className="text-sm font-medium">
            {t("Status")}
          </Label>
          <Select
            value={editingAppointment.status}
            onValueChange={(value: AppointmentStatus) =>
              setEditingAppointment((prev) =>
                prev ? { ...prev, status: value } : null
              )
            }
          >
            <SelectTrigger className="h-12 border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-lg border-2 border-primary/20">
              <SelectItem value="upcoming">{t("Upcoming")}</SelectItem>
              <SelectItem value="completed">{t("Completed")}</SelectItem>
              <SelectItem value="cancelled">{t("Cancelled")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="editNotes" className="text-sm font-medium">
            {t("Notes")}
          </Label>
          <Textarea
            id="editNotes"
            value={editingAppointment.notes || ""}
            onChange={(e) =>
              setEditingAppointment((prev) =>
                prev ? { ...prev, notes: e.target.value } : null
              )
            }
            className="min-h-[100px] border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl resize-none"
            placeholder={t("Add any additional notes...")}
          />
        </div>

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
