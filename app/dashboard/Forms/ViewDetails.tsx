import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Appointment } from "@/Global/Types/types";
import { getStatusColor } from "@/Global/Utils/statusIndicator";
import { CalendarIcon, Clock, Mail, Phone } from "lucide-react";
import React from "react";

interface ViewDetailsProps {
  handleEditAppointment?: () => void;
  handleDeleteAppointment?: () => void;
  selectedAppointment: Appointment;
}

const ViewDetails = ({
  handleEditAppointment,
  handleDeleteAppointment,
  selectedAppointment,
}: ViewDetailsProps) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">{selectedAppointment.clientName}</h3>
        <Badge
          className={`${getStatusColor(
            selectedAppointment.status
          )} px-3 py-1 rounded-full font-semibold`}
        >
          {t(
            selectedAppointment.status.charAt(0).toUpperCase() +
              selectedAppointment.status.slice(1)
          )}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <span>{selectedAppointment.clientEmail}</span>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-primary" />
            <span>{selectedAppointment.clientPhone}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <span>
              {new Date(selectedAppointment.date).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <span>{selectedAppointment.time}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold text-primary">{t("Service")}</h4>
        <p className="text-lg">{selectedAppointment.service}</p>
      </div>

      {selectedAppointment.notes && (
        <div className="space-y-2">
          <h4 className="font-semibold text-primary">{t("Notes")}</h4>
          <p className="text-muted-foreground bg-muted/50 p-3 rounded-lg">
            {selectedAppointment.notes}
          </p>
        </div>
      )}
      {handleEditAppointment && handleDeleteAppointment && (
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleEditAppointment}
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-xl"
          >
            {t("Edit Appointment")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteAppointment}
            className="flex-1 rounded-xl"
          >
            {t("Delete Appointment")}
          </Button>
        </div>
      )}
    </>
  );
};

export default ViewDetails;
