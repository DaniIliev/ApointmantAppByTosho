"use client";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, X, Trash2 } from "lucide-react";
import callApi from "@/app/Api/callApi";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { CustomTooltip } from "../customUIComponents/CustomTooltip";

// Interfaces
interface AppointmentInfo {
  _id: string;
  clientName: string;
  clientPhone?: string;
  email?: string;
  appointmentTime: { start: string; end: string };
  service?: { _id: string; name: string } | string;
  status?: string;
  staff?: string;
}

interface Alert {
  _id: string;
  isRead: boolean;
  message: string;
  createdAt: string;
  updatedAt?: string;
  type: string;
  appointment?: AppointmentInfo;
}

interface NotificationsPanelProps {
  isOpen: boolean;
  alerts: Alert[];
  onAlertsChange: (alerts: Alert[]) => void;
}

export default function NotificationsPanel({
  isOpen,
  alerts,
  onAlertsChange,
}: NotificationsPanelProps) {
  const { t } = useTranslation();
  const [isConfirmingAll, setIsConfirmingAll] = useState(false);

  const handleAlertClick = async (alert: Alert) => {
    if (!alert.isRead) {
      try {
        await callApi(`/api/alerts/${alert._id}/read`, "PUT", {});
        onAlertsChange(
          alerts.map((a) => (a._id === alert._id ? { ...a, isRead: true } : a))
        );
      } catch (error) {
        console.error("Failed to mark alert as read:", error);
      }
    }
  };

  const handleConfirmAppointment = async (alert: Alert) => {
    try {
      const appointmentId = alert.appointment?._id;
      const alertId = alert._id;

      if (!appointmentId) {
        toast.error(t("This alert has no appointment to confirm."));
        return;
      }

      const confirmedAppointment = await callApi(
        `/api/appointment/${appointmentId}/status`,
        "PUT",
        { status: "confirmed" }
      );

      if (confirmedAppointment) {
        await callApi(`/api/alerts/${alertId}`, "DELETE");
        onAlertsChange(alerts.filter((a) => a._id !== alert._id));
        toast.success(t("Appointment confirmed successfully!"));
      }
    } catch (error) {
      console.error("Failed to confirm appointment:", error);
      toast.error(t("Failed to confirm appointment. Please try again."));
    }
  };

  const handleCancelAppointment = async (alert: Alert) => {
    try {
      const appointmentId = alert.appointment?._id;
      const alertId = alert._id;

      if (!appointmentId) {
        toast.error(t("This alert has no appointment to cancel."));
        return;
      }

      const cancelledAppointment = await callApi(
        `/api/appointment/${appointmentId}/status`,
        "PUT",
        { status: "cancelled" }
      );

      if (cancelledAppointment) {
        await callApi(`/api/alerts/${alertId}`, "DELETE");
        onAlertsChange(alerts.filter((a) => a._id !== alert._id));
        toast.success(t("Appointment cancelled successfully!"));
      }
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      toast.error(t("Failed to cancel appointment. Please try again."));
    }
  };

  const handleDeleteNotification = async (alertId: string) => {
    try {
      await callApi(`/api/alerts/${alertId}`, "DELETE");
      onAlertsChange(alerts.filter((a) => a._id !== alertId));
      toast.success(t("Notification deleted successfully!"));
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error(t("Failed to delete notification. Please try again."));
    }
  };

  const handleConfirmAllAppointments = async () => {
    const appointmentAlerts = alerts.filter(
      (alert) => alert.type === "appointment" && alert.appointment?._id
    );

    if (appointmentAlerts.length === 0) {
      toast.info(t("No appointments to confirm."));
      return;
    }

    setIsConfirmingAll(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const alert of appointmentAlerts) {
        try {
          const appointmentId = alert.appointment?._id;
          const alertId = alert._id;

          if (appointmentId) {
            const confirmedAppointment = await callApi(
              `/api/appointment/${appointmentId}/status`,
              "PUT",
              { status: "confirmed" }
            );

            if (confirmedAppointment) {
              await callApi(`/api/alerts/${alertId}`, "DELETE");
              successCount++;
            }
          }
        } catch (error) {
          console.error("Failed to confirm individual appointment:", error);
          errorCount++;
        }
      }

      // Update alerts
      onAlertsChange(
        alerts.filter(
          (alert) =>
            !(
              alert.type === "appointment" &&
              appointmentAlerts.some((a) => a._id === alert._id)
            )
        )
      );

      if (successCount > 0 && errorCount === 0) {
        toast.success(
          t(`${successCount} appointment(s) confirmed successfully!`)
        );
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(
          t(`${successCount} appointment(s) confirmed, ${errorCount} failed.`)
        );
      } else {
        toast.error(t("Failed to confirm all appointments."));
      }
    } finally {
      setIsConfirmingAll(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-72 md:w-80 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-3 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-bold">{t("Notifications")}</h3>
        {alerts.filter((a) => a.type === "appointment" && a.appointment?._id)
          .length > 0 && (
          <Button
            onClick={handleConfirmAllAppointments}
            disabled={isConfirmingAll}
            size="sm"
            variant="destructive"
            className="ml-2 h-8 px-2 text-xs font-semibold text-white bg-accent/90 rounded-md border border-white/10 hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            {t("Confirm All")}
          </Button>
        )}
      </div>

      {alerts.length > 0 ? (
        alerts.map((alert) => {
          const appt = alert.appointment;
          const hasAppt = alert.type === "appointment" && !!appt;

          return (
            <div
              key={alert._id}
              onClick={() => handleAlertClick(alert)}
              className={`mb-2 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                !alert.isRead
                  ? "bg-blue-600/20 border-l-4 border-blue-400"
                  : "bg-white/5"
              } hover:bg-white/10`}
            >
              <p className="text-sm font-semibold text-white/90">
                {alert.message}
              </p>
              {hasAppt ? (
                <>
                  <p className="text-xs text-white/60 mt-1">
                    {t("Appointment from")}: {appt?.clientName ?? t("Unknown")}
                  </p>
                  <p className="text-xs text-white/60">
                    {t("Time")}:{" "}
                    {appt?.appointmentTime?.start
                      ? new Date(appt.appointmentTime.start).toLocaleTimeString(
                          "bg-BG",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "N/A"}
                    -
                    {appt?.appointmentTime?.end
                      ? new Date(appt.appointmentTime.end).toLocaleTimeString(
                          "bg-BG",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "N/A"}
                  </p>
                  <div className="flex gap-2 justify-end mt-3">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmAppointment(alert);
                      }}
                      size="sm"
                      className="h-7 px-2 text-xs font-semibold text-white  bg-accent/90 rounded-md border border-white/10 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      {t("Confirm")}
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelAppointment(alert);
                      }}
                      size="sm"
                      //   variant="outline"
                      className="h-7 px-2 text-xs font-semibold text-white bg-red-600/90 rounded-md border border-white/10 hover:bg-red-600 transition-colors flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      {t("Cancel")}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-white/60 mt-1">
                    {new Date(alert.createdAt).toLocaleString("bg-BG")}
                  </p>
                  <div className="flex justify-end mt-2">
                    <CustomTooltip
                      onClick={() => {
                        handleDeleteNotification(alert._id);
                      }}
                      tooltipText={t("Delete")}
                      icon={<Trash2 color="white" />}
                    />
                  </div>
                </>
              )}
            </div>
          );
        })
      ) : (
        <p className="text-white/80">{t("You have no new notifications.")}</p>
      )}
    </div>
  );
}
