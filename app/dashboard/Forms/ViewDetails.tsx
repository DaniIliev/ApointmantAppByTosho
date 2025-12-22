import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Appointment } from "@/Global/Types/types";
import { getStatusColor } from "@/Global/Utils/statusIndicator";
import { CalendarIcon, Clock, Mail, Phone, Timer, Euro } from "lucide-react";
import React from "react";
import { formatDateAndTime, formatPriceEUR } from "@/Global/Utils/commonFn";
import { useAuthContext } from "@/context/AuthContext";

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
  const { user } = useAuthContext();
  return (
    <>
      <div className="flex items-center justify-between mb-3">
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
            <span>{selectedAppointment.email}</span>
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
              {new Date(
                selectedAppointment.appointmentTime.start
              ).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <span>
              {formatDateAndTime(
                selectedAppointment.appointmentTime.start,
                "time"
              )}{" "}
              -{" "}
              {formatDateAndTime(
                selectedAppointment.appointmentTime.end,
                "time"
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {/* <h4 className="font-semibold text-primary">{t("Service")}</h4> */}
        <p className="text-lg mt-2 mb-2">{selectedAppointment.serviceName}</p>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {typeof selectedAppointment.serviceDuration === "number" && (
            <div className="flex items-center gap-2 text-sm">
              <Timer className="h-4 w-4 text-primary" />
              <span>
                {t("Duration")}: {selectedAppointment.serviceDuration}{" "}
                {t("min")}
              </span>
            </div>
          )}
          {typeof selectedAppointment.servicePrice === "number" && (
            <div className="flex items-center gap-2 text-sm">
              <Euro className="h-4 w-4 text-primary" />
              <span>
                {t("Price")}: {formatPriceEUR(selectedAppointment.servicePrice)}
              </span>
            </div>
          )}
        </div>
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
        <div className="flex justify-center gap-3 pt-4 mt-4">
          {user && (user.role === "business" || user.role == "staff") && (
            <Button
              variant="outline"
              onClick={handleDeleteAppointment}
              iconType="delete"
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              {t("Delete")}
            </Button>
          )}
          <Button onClick={handleEditAppointment} iconType="edit">
            {t("Edit")}
          </Button>
        </div>
      )}
    </>
  );
};

export default ViewDetails;
