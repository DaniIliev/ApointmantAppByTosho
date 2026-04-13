import { Appointment } from "../Types/types";

export interface GroupedAppointment {
  isGroup: boolean;
  appointments: Appointment[];
  mainAppointment: Appointment; // The first one to take general info from
  count: number;
}

/**
 * Groups appointments by unique slot (staff, service, location, time).
 */
export const groupAppointments = (appointments: Appointment[]): (Appointment | GroupedAppointment)[] => {
  const groups: Record<string, Appointment[]> = {};

  appointments.forEach((apt) => {
    const staffId = typeof apt.staff === "string" ? apt.staff : apt.staff?._id;
    const serviceId = apt.serviceName; // Grouping by serviceName is safer for UI, or use service ID if available
    const startTime = apt.appointmentTime.start;
    const endTime = apt.appointmentTime.end;
    const locationId = apt.locationId || "default";

    const key = `${staffId}-${serviceId}-${locationId}-${startTime}-${endTime}`;

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(apt);
  });

  const result: (Appointment | GroupedAppointment)[] = [];

  Object.values(groups).forEach((group) => {
    if (group.length > 1) {
      result.push({
        isGroup: true,
        appointments: group,
        mainAppointment: group[0],
        count: group.length,
      } as GroupedAppointment);
    } else {
      result.push(group[0]);
    }
  });

  return result;
};
