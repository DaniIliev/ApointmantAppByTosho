import React from "react";
import { useTranslation } from "react-i18next";
import { Appointment } from "@/Global/Types/types";
import { StatusChip } from "@/components/customUIComponents/StatusChip";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/AuthContext";
import { CalendarIcon, Clock, Timer, User } from "lucide-react";
import { formatDateAndTime } from "@/Global/Utils/commonFn";

interface WorkBlockDetailsProps {
  selectedAppointment: Appointment;
  handleDeleteAppointment?: () => void;
}

const WorkBlockDetails = ({
  selectedAppointment,
  handleDeleteAppointment,
}: WorkBlockDetailsProps) => {
  const { t } = useTranslation();
  const { user } = useAuthContext();

  const startDate = new Date(selectedAppointment.appointmentTime.start);
  const endDate = new Date(selectedAppointment.appointmentTime.end);
  const calculatedDuration = Math.max(
    0,
    Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)),
  );
  const durationMinutes =
    typeof selectedAppointment.serviceDuration === "number"
      ? selectedAppointment.serviceDuration
      : calculatedDuration;

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-xl font-bold break-words">
          {selectedAppointment.title || t("Work Block")}
        </h3>
        <StatusChip status={selectedAppointment.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <span>
              {new Date(
                selectedAppointment.appointmentTime.start,
              ).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <span>
              {formatDateAndTime(
                selectedAppointment.appointmentTime.start,
                "time",
              )}{" "}
              -{" "}
              {formatDateAndTime(
                selectedAppointment.appointmentTime.end,
                "time",
              )}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Timer className="h-5 w-5 text-primary" />
            <span>
              {t("Duration")}: {durationMinutes} {t("min")}
            </span>
          </div>

          {selectedAppointment.staff?.firstName + " " + selectedAppointment.staff?.lastName && (
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <span>
                {t("Staff")}: {selectedAppointment.staff.firstName + " " + selectedAppointment.staff.lastName}
              </span>
            </div>
          )}
        </div>
      </div>

      {selectedAppointment.notes && (
        <div className="space-y-2 mt-4">
          <h4 className="font-semibold text-primary">{t("Notes")}</h4>
          <p className="text-muted-foreground bg-muted/50 p-3 rounded-lg">
            {selectedAppointment.notes}
          </p>
        </div>
      )}

      {handleDeleteAppointment &&
        user &&
        (user.role === "business" || user.role === "staff") && (
          <div className="flex justify-center gap-3 pt-4 mt-4">
            <Button
              variant="outline"
              onClick={handleDeleteAppointment}
              iconType="delete"
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              {t("Delete Block")}
            </Button>
          </div>
        )}
    </>
  );
};

export default WorkBlockDetails;
