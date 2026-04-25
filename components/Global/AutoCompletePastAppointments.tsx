"use client";
import { useCallback, useEffect, useRef } from "react";
import callApi from "@/app/Api/callApi";
import { useAuthContext } from "@/context/AuthContext";
import type { Appointment } from "@/Global/Types/types";

interface AutoCompletePastAppointmentsProps {
  disabled?: boolean;
}

export default function AutoCompletePastAppointments({
  disabled,
}: AutoCompletePastAppointmentsProps) {
  const { user } = useAuthContext();
  const isRunningRef = useRef(false);

  const run = useCallback(async () => {
    if (disabled || !user || (user.role !== "staff" && user.role !== "business"))
      return;
    if (isRunningRef.current) return; // prevent overlapping runs
    isRunningRef.current = true;

    try {
      const data: Appointment[] = await callApi(
        "/api/appointment/dashboard",
        "GET"
      );
      const now = new Date();

      const toComplete = (Array.isArray(data) ? data : []).filter(
        (apt: Appointment) =>
          apt &&
          apt.status !== "completed" &&
          apt.status !== "cancelled" &&
          apt.appointmentTime?.end &&
          new Date(apt.appointmentTime.end) < now
      );

      if (toComplete.length === 0) return;

      await Promise.all(
        toComplete.map((apt: Appointment) =>
          callApi(`/api/appointment/${apt._id}/status`, "PUT", {
            status: "completed",
          })
        )
      );
      // No toast here to avoid noise; UI will reflect via normal fetches
    } catch {
      // Silent fail; background task should not interrupt UX
      // console.error("Auto-complete background task failed", e);
    } finally {
      isRunningRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    // initial run after mount / user change
    void run();
    const id = setInterval(() => void run(), 60_000);
    return () => clearInterval(id);
  }, [run]);

  return null;
}
