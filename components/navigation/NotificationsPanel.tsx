"use client";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, X, Trash2, CreditCard } from "lucide-react";

import callApi from "@/app/Api/callApi";
import { Button } from "../ui/button";
import { CustomTooltip } from "../customUIComponents/CustomTooltip";
import { formatDateAndTime } from "@/Global/Utils/commonFn";
import { Alert } from "@/Global/Types/types";


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

  const formatTime = (value?: string) => {
    if (!value) return "N/A";
    const formatted = formatDateAndTime(value, "time");
    return formatted === value ? "N/A" : formatted;
  };

  const formatDate = (value?: string) => {
    if (!value) return "N/A";
    const formatted = formatDateAndTime(value, "date");
    return formatted === value ? "N/A" : formatted;
  };

  const formatDateTime = (value?: string) => {
    if (!value) return t("Unknown date");
    const formatted = formatDateAndTime(value, "dateTime");
    return formatted === value ? t("Unknown date") : formatted;
  };

  const handleAlertClick = async (alert: Alert) => {
    if (!alert.isRead) {
      try {
        await callApi(`/api/alerts/${alert._id}/read`, "PUT", {});
        onAlertsChange(
          alerts.map((a) => (a._id === alert._id ? { ...a, isRead: true } : a)),
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
        return;
      }

      const confirmedAppointment = await callApi(
        `/api/appointment/${appointmentId}/status`,
        "PUT",
        { status: "confirmed" },
      );

      if (confirmedAppointment) {
        await callApi(`/api/alerts/${alertId}`, "DELETE");
        onAlertsChange(alerts.filter((a) => a._id !== alert._id));
      }
    } catch (error) {
      console.error("Failed to confirm appointment:", error);
    }
  };

  const handleCancelAppointment = async (alert: Alert) => {
    try {
      const appointmentId = alert.appointment?._id;
      const alertId = alert._id;

      if (!appointmentId) {
        return;
      }

      const cancelledAppointment = await callApi(
        `/api/appointment/${appointmentId}/status`,
        "PUT",
        { status: "cancelled" },
      );

      if (cancelledAppointment) {
        await callApi(`/api/alerts/${alertId}`, "DELETE");
        onAlertsChange(alerts.filter((a) => a._id !== alert._id));
      }
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
    }
  };

  const handleDeleteNotification = async (alertId: string) => {
    try {
      await callApi(`/api/alerts/${alertId}`, "DELETE");
      onAlertsChange(alerts.filter((a) => a._id !== alertId));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleConfirmAllAppointments = async () => {
    const appointmentAlerts = alerts.filter((alert) => alert.appointment?._id);
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
              { status: "confirmed" },
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
            ),
        ),
      );
    } finally {
      setIsConfirmingAll(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-72 md:w-80 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-3 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-bold">{t("Notifications")}</h3>
        {alerts?.filter((a) => a.appointment?._id).length > 0 && (
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

      {alerts?.length > 0 ? (
        alerts.map((alert) => {
          const appt = alert.appointment;
          const hasAppt = !!appt && !!appt._id;

          return (
            <div
              key={alert._id}
              onClick={() => handleAlertClick(alert)}
              className={`mb-2 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                !alert.isRead
                  ? "bg-primary/30 border-l-4 border-primary-light"
                  : "bg-primary/10"
              } hover:bg-primary/15`}
            >
              <p className="text-sm font-semibold text-white/90">
                {t(alert.messageKey, alert.params || {}) as string}
              </p>
              {hasAppt ? (
                <>
                  <p className="text-xs text-white/60 mt-1">
                    {t("Appointment from")}: {appt?.clientName ?? t("Unknown")}
                  </p>
                  <p className="text-xs text-white/60">
                    {t("Date")}: {formatDate(appt?.appointmentTime?.start)}
                  </p>
                  <p className="text-xs text-white/60">
                    {t("Time")}: {formatTime(appt?.appointmentTime?.start)}-
                    {formatTime(appt?.appointmentTime?.end)}
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
                      variant="outline"
                      className="h-7 px-2 text-xs font-semibold  rounded-md border flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      {t("Cancel")}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-white/60 mt-1">
                    {formatDateTime(alert.createdAt)}
                  </p>
                  <div className="flex justify-end mt-2 gap-2">
                    {alert.type === "subscription_expiring" && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = "/dashboard/subscription";
                        }}
                        size="sm"
                        className="h-7 px-2 text-xs font-semibold text-white bg-primary/80 rounded-md border border-white/10 flex items-center gap-1"
                      >
                        <CreditCard className="w-3 h-3" />
                        {t("Manage")}
                      </Button>
                    )}
                    <CustomTooltip
                      stopPropagation
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
