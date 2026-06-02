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

export function getLateStatus(now = new Date()) {
  const lateAfter = process.env.LATE_AFTER ?? "09:15";
  const [hour, minute] = lateAfter.split(":").map(Number);
  const threshold = new Date(now);
  threshold.setHours(hour, minute, 0, 0);
  return now > threshold ? "LATE" : "CHECKED_IN";
}

export function hoursBetween(start?: Date | null, end?: Date | null) {
  if (!start || !end) return 0;
  return Math.max(0, (end.getTime() - start.getTime()) / 36e5);
}
