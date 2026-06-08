const APP_TIME_ZONE = "Europe/Istanbul";
const DEFAULT_WORK_START = "09:00";
const DEFAULT_WORK_END = "10:00";

function parseTime(value: string) {
  const [hour = 0, minute = 0] = value.split(":").map(Number);
  return { hour, minute, totalMinutes: hour * 60 + minute };
}

export function getWorkSchedule() {
  return {
    start: process.env.WORK_START ?? process.env.LATE_AFTER ?? DEFAULT_WORK_START,
    end: process.env.WORK_END ?? DEFAULT_WORK_END
  };
}

export function getAttendanceSchedule(schedule?: {
  employeeStart?: string | null;
  employeeEnd?: string | null;
  storeStart?: string | null;
  storeEnd?: string | null;
}) {
  const fallback = getWorkSchedule();
  return {
    start: schedule?.employeeStart ?? schedule?.storeStart ?? fallback.start,
    end: schedule?.employeeEnd ?? schedule?.storeEnd ?? fallback.end
  };
}

export function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function startOfMonth() {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function formatDateTime(date?: Date | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: APP_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

export function formatHours(hours: number) {
  return `${hours.toLocaleString("tr-TR", { maximumFractionDigits: 1 })} sa`;
}

export function getLateStatus(now = new Date(), expectedStart?: string | null, toleranceMinutes = 0) {
  const { start } = getAttendanceSchedule({ employeeStart: expectedStart });
  const workStart = parseTime(start);
  const parts = new Intl.DateTimeFormat("tr-TR", {
    timeZone: APP_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(now);
  const currentHour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const currentMinute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  return currentTotalMinutes > workStart.totalMinutes + toleranceMinutes ? "LATE" : "CHECKED_IN";
}

export function hoursBetween(start?: Date | null, end?: Date | null) {
  if (!start || !end) return 0;
  return Math.max(0, (end.getTime() - start.getTime()) / 36e5);
}
