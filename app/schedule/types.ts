import type {
  TimeRange as GlobalTimeRange,
  WeeklyWorkingDay as GlobalWeeklyWorkingDay,
  WeeklyWorkingHours as GlobalWeeklyWorkingHours,
  WorkHour as GlobalWorkHour,
} from "@/Global/Types/types";

// ─── Re-exports ───────────────────────────────────────────
export type TimeRange = GlobalTimeRange;
export type WeeklyWorkingDay = GlobalWeeklyWorkingDay;
export type WeeklyWorkingHours = GlobalWeeklyWorkingHours;

// ─── Day-off map ──────────────────────────────────────────
export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type DayOffMap = Record<DayKey, boolean>;

// ─── Staff (populated inside a schedule) ──────────────────
export interface ScheduleStaffPopulated {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

// ─── Staff member (from staff list) ───────────────────────
export interface StaffMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  profilePictureUrl?: string;
  rating?: number;
  ratingCount?: number;
  locationIds?: string[];
}

// ─── Location DTO ─────────────────────────────────────────
export interface LocationDto {
  _id: string;
  name: string;
  weeklyWorkingHours?: WeeklyWorkingHours;
}

// ─── Schedule (from GET /api/staff-schedules) ─────────────
export interface Schedule {
  _id: string;
  startDate: string;
  endDate: string;
  staff?: ScheduleStaffPopulated | string | null;
  location?: string;
  locationId?: string;
  business: string;
  dailySchedule?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Editable schedule (used inside ScheduleModal) ────────
export interface EditableSchedule {
  _id: string;
  startDate: string;
  endDate: string;
  weeklyWorkingHours: WeeklyWorkingHours;
  breaks: TimeRange[];
  locationId?: string;
  location?: string;
  staff?: ScheduleStaffPopulated | string | null;
  business: string;
  dailySchedule?: string;
  dayleschedules?: DayViewEntry[];
}

// ─── Daily view entry (from GET /daily-view) ──────────────
export interface DayViewEntry {
  _id: string;
  day: string;
  date: string;
  isDayOff: boolean;
  workTime?: TimeRange;
  breaks?: TimeRange[];
  staffId?: string;
  scheduleId?: string;
  location?: string;
  locationId?: string;
}

export interface GroupedStaffSchedule {
  staff: ScheduleStaffPopulated;
  location: string;
  schedules: (Schedule & { dayleschedules: DayViewEntry[] })[];
}

export type DailyViewData = GroupedStaffSchedule[];

// ─── Work hour entry (for detail page) ────────────────────
export interface WorkHourEntry extends GlobalWorkHour {
  _id: string;
  scheduleId?: string;
}

// ─── Create schedule payload ──────────────────────────────
export interface CreateSchedulePayload {
  startDate: string;
  endDate: string;
  weeklyWorkingHours: WeeklyWorkingHours;
  breaks?: TimeRange[];
  locationId: string;
  staffId?: string;
}

// ─── Update schedule payload ──────────────────────────────
export interface UpdateSchedulePayload {
  startDate?: string;
  endDate?: string;
  weeklyWorkingHours?: WeeklyWorkingHours;
  breaks?: TimeRange[];
  locationId?: string;
}

// ─── Update daily schedule payload ────────────────────────
export interface UpdateDailySchedulePayload {
  workHour?: WorkHourEntry;
  workHours?: WorkHourEntry[];
}

