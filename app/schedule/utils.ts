import { addDays, format, isWithinInterval, parseISO } from "date-fns";

import type {
  DayKey,
  DayOffMap,
  EditableSchedule,
  Schedule,
  StaffMember,
  TimeRange,
  WeeklyWorkingHours,
} from "./types";

export type { DayKey };

export interface WorkRule {
  id: string;
  days: DayKey[];
  workTime: TimeRange;
  breaks: TimeRange[];
}

// ─── Day constants ────────────────────────────────────────
export const dayKeys: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const dayTitles = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const dayLabels: Record<DayKey, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

export const defaultDayOff: DayOffMap = {
  monday: false,
  tuesday: false,
  wednesday: false,
  thursday: false,
  friday: false,
  saturday: true,
  sunday: true,
};

// ─── Schedule helpers ─────────────────────────────────────

export const getScheduleStaffId = (schedule: Schedule): string | null => {
  if (!schedule.staff) return null;
  return typeof schedule.staff === "string"
    ? schedule.staff
    : schedule.staff._id || null;
};

export const getLocationIdFromSchedule = (schedule: Schedule): string => {
  return schedule.location || schedule.locationId || "";
};

export const normalizeTimeRange = (range?: TimeRange): TimeRange => ({
  start: range?.start ?? null,
  end: range?.end ?? null,
});

export const getDayKeyFromDate = (date: Date): DayKey => {
  const idx = date.getDay();
  return idx === 0 ? "sunday" : dayKeys[idx - 1];
};

export const isScheduleActiveOnDate = (
  schedule: Schedule,
  date: Date,
): boolean => {
  const start = parseISO(schedule.startDate);
  const end = parseISO(schedule.endDate);
  return isWithinInterval(date, { start, end });
};

export const parseTimeToMinutes = (
  time: string | null | undefined,
): number | null => {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

export const hasTimeOverlap = (left: TimeRange, right: TimeRange): boolean => {
  const leftStart = parseTimeToMinutes(left.start);
  const leftEnd = parseTimeToMinutes(left.end);
  const rightStart = parseTimeToMinutes(right.start);
  const rightEnd = parseTimeToMinutes(right.end);

  if (
    leftStart === null ||
    leftEnd === null ||
    rightStart === null ||
    rightEnd === null
  ) {
    return false;
  }

  return leftStart < rightEnd && rightStart < leftEnd;
};

export const buildWeekDays = (weekStart: Date): Date[] =>
  Array.from({ length: 7 }, (_, idx) => addDays(weekStart, idx));

// ─── Staff helpers ────────────────────────────────────────

export const getFullName = (staff: StaffMember): string =>
  `${staff.firstName || ""} ${staff.lastName || ""}`.trim() || staff.email;

export const getStaffInitials = (staff: StaffMember): string => {
  const first = (staff.firstName || "").trim();
  const last = (staff.lastName || "").trim();

  if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  if (last) return last.slice(0, 2).toUpperCase();
  return (staff.email || "U").slice(0, 2).toUpperCase();
};

export const pickScheduleForDate = (
  schedules: Schedule[],
  targetDate: Date,
  selectedLocationId?: string,
): Schedule | null => {
  const active = schedules.filter((s) => isScheduleActiveOnDate(s, targetDate));
  if (!active.length) return null;

  if (selectedLocationId) {
    const match = active.find(
      (s) => getLocationIdFromSchedule(s) === selectedLocationId,
    );
    if (match) return match;
  }

  return active.sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
};

// ─── Modal / form helpers ─────────────────────────────────

export const createEmptySchedule = (
  defaultLocationId?: string,
): EditableSchedule => ({
  _id: "",
  startDate: "",
  endDate: "",
  weeklyWorkingHours: {
    monday: {
      isDayOff: false,
      workTime: { start: null, end: null },
      breaks: [],
    },
    tuesday: {
      isDayOff: false,
      workTime: { start: null, end: null },
      breaks: [],
    },
    wednesday: {
      isDayOff: false,
      workTime: { start: null, end: null },
      breaks: [],
    },
    thursday: {
      isDayOff: false,
      workTime: { start: null, end: null },
      breaks: [],
    },
    friday: {
      isDayOff: false,
      workTime: { start: null, end: null },
      breaks: [],
    },
    saturday: {
      isDayOff: true,
      workTime: { start: null, end: null },
      breaks: [],
    },
    sunday: {
      isDayOff: true,
      workTime: { start: null, end: null },
      breaks: [],
    },
  },
  breaks: [{ start: null, end: null }],
  locationId: defaultLocationId || "",
  location: defaultLocationId,
  staff: null,
  business: "",
  dailySchedule: "",
});

export const normalizeForForm = (
  schedule: EditableSchedule,
): EditableSchedule => {
  const normalized: EditableSchedule = {
    ...schedule,
    startDate: schedule.startDate ? schedule.startDate.split("T")[0] : "",
    endDate: schedule.endDate ? schedule.endDate.split("T")[0] : "",
    breaks: Array.isArray(schedule.breaks)
      ? schedule.breaks.map(normalizeTimeRange)
      : [
          (schedule as any).break1,
          (schedule as any).break2,
          (schedule as any).break3,
        ]
          .filter((b) => b && (b.start || b.end))
          .map(normalizeTimeRange),
  };

  if (!normalized.breaks.length) {
    normalized.breaks = [{ start: null, end: null }];
  }

  if (!schedule.weeklyWorkingHours) {
    // If we have daily schedules, reconstruction is preferred
    if (schedule.dayleschedules && schedule.dayleschedules.length > 0) {
      const reconstructed: any = {};
      dayKeys.forEach((dayKey) => {
        // Find the first entry for this day of the week in the range
        const dayData = schedule.dayleschedules?.find((d) => d.day === dayKey);
        if (dayData) {
          reconstructed[dayKey] = {
            isDayOff: dayData.isDayOff,
            workTime: normalizeTimeRange(dayData.workTime),
            breaks: (dayData.breaks || []).map(normalizeTimeRange),
          };
        } else {
          // Fallback if a specific day of the week is missing in the provided range
          reconstructed[dayKey] = {
            isDayOff: true,
            workTime: { start: null, end: null },
            breaks: [],
          };
        }
      });
      normalized.weeklyWorkingHours = reconstructed as WeeklyWorkingHours;
    } else {
      // Default fallback if no template and no daily data
      normalized.weeklyWorkingHours = {
        monday: {
          isDayOff: false,
          workTime: { start: null , end: null },
          breaks: [],
        },
        tuesday: {
          isDayOff: false,
          workTime: { start: null, end: null },
          breaks: [],
        },
        wednesday: {
          isDayOff: false,
          workTime: { start: null, end: null },
          breaks: [],
        },
        thursday: {
          isDayOff: false,
          workTime: { start: null, end: null },
          breaks: [],
        },
        friday: {
          isDayOff: false,
          workTime: { start: null, end: null },
          breaks: [],
        },
        saturday: {
          isDayOff: true,
          workTime: { start: null, end: null },
          breaks: [],
        },
        sunday: {
          isDayOff: true,
          workTime: { start: null, end: null },
          breaks: [],
        },
      };
    }

    const oldWorkTime = (schedule as any).workTime;
    const oldIsDayOff = (schedule as any).isDayOff;

    if (oldWorkTime || oldIsDayOff) {
      dayKeys.forEach((day) => {
        const isOff = oldIsDayOff
          ? !!oldIsDayOff[day]
          : normalized.weeklyWorkingHours[day].isDayOff;
        normalized.weeklyWorkingHours[day] = {
          isDayOff: isOff,
          workTime: normalizeTimeRange(
            oldWorkTime || normalized.weeklyWorkingHours[day].workTime,
          ),
          breaks: [],
        };
      });
    }
  } else {
    const wwh = { ...normalized.weeklyWorkingHours };
    dayKeys.forEach((day) => {
      if (wwh[day]) {
        wwh[day] = {
          ...wwh[day],
          workTime: normalizeTimeRange(wwh[day].workTime),
          breaks: Array.isArray(wwh[day].breaks)
            ? wwh[day].breaks!.map(normalizeTimeRange)
            : [
                (wwh[day] as any).break1,
                (wwh[day] as any).break2,
                (wwh[day] as any).break3,
              ]
                .filter((b) => b && (b.start || b.end))
                .map(normalizeTimeRange),
        };
      }
    });
    normalized.weeklyWorkingHours = wwh;
  }

  return normalized;
};

export const readBreaks = (schedule: EditableSchedule): TimeRange[] => {
  const active = (schedule.breaks || []).filter(
    (item) => item.start || item.end,
  );
  return active.length ? active : [{ start: null, end: null }];
};

export const writeBreaks = (
  schedule: EditableSchedule,
  breaks: TimeRange[],
): EditableSchedule => ({
  ...schedule,
  breaks: breaks.map(normalizeTimeRange),
});

// ─── Rule-based Conversion ────────────────────────────────

/**
 * Groups identical days into Rules and identifies Rest Days.
 */
export const convertToRules = (
  wwh: WeeklyWorkingHours,
): { rules: WorkRule[]; restDays: DayKey[] } => {
  const rules: WorkRule[] = [];
  const restDays: DayKey[] = [];

  const groups: Record<string, DayKey[]> = {};

  dayKeys.forEach((dayKey) => {
    const day = wwh[dayKey];
    if (day.isDayOff) {
      restDays.push(dayKey);
      return;
    }

    // Create a stable key based on workTime and breaks
    const key = JSON.stringify({
      wt: { start: day.workTime.start, end: day.workTime.end },
      br: (day.breaks || [])
        .filter((b) => b.start || b.end)
        .map((b) => ({ s: b.start, e: b.end }))
        .sort((a, b) => (a.s || "").localeCompare(b.s || "")),
    });

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(dayKey);
  });

  Object.entries(groups).forEach(([key, days], index) => {
    const { wt, br } = JSON.parse(key);
    rules.push({
      id: `rule-${index}-${Date.now()}`,
      days,
      workTime: { start: wt.start, end: wt.end },
      breaks: br.map((b: any) => ({ start: b.s, end: b.e })),
    });
  });

  return { rules, restDays };
};

/**
 * flattens Rules and Rest Days back into WeeklyWorkingHours.
 */
export const convertToWWH = (
  rules: WorkRule[],
  restDays: DayKey[],
): WeeklyWorkingHours => {
  const wwh: any = {};

  // Initialize all as off
  dayKeys.forEach((day) => {
    wwh[day] = {
      isDayOff: true,
      workTime: { start: null, end: null },
      breaks: [],
    };
  });

  // Apply Rules
  rules.forEach((rule) => {
    rule.days.forEach((day) => {
      wwh[day] = {
        isDayOff: false,
        workTime: { ...rule.workTime },
        breaks: rule.breaks.filter((b) => b.start || b.end),
      };
    });
  });

  // Apply Rest Days (explicitly, in case of overlaps, last one wins or rules take priority?)
  // Actually if a day is in rules, it's not off. If it's in restDays, it is off.
  restDays.forEach((day) => {
    wwh[day] = {
      isDayOff: true,
      workTime: { start: null, end: null },
      breaks: [],
    };
  });

  return wwh as WeeklyWorkingHours;
};
