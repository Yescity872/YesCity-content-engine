/**
 * lib/date.ts
 * Date utility helpers using Asia/Kolkata (IST) timezone.
 * All weekly planner and scraping logic should use these helpers
 * to ensure consistent IST-based date handling.
 */

const IST_TIMEZONE = "Asia/Kolkata";

/**
 * Returns the current date/time in IST.
 * IST = UTC+5:30, so we add 5.5 hours to UTC.
 */
export function getNowIST(): Date {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  const istOffsetMs = 5.5 * 60 * 60 * 1000; // +5:30
  return new Date(utcMs + istOffsetMs);
}

/**
 * Returns today's date in IST as a YYYY-MM-DD string.
 */
export function getTodayISTString(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: IST_TIMEZONE });
}

/**
 * Returns the Monday of the current IST week.
 */
export function getWeekStartIST(): Date {
  const now = getNowIST();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday ...
  const diff = day === 0 ? -6 : 1 - day; // adjust so Monday is day 0
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Returns the Sunday of the current IST week.
 */
export function getWeekEndIST(): Date {
  const monday = getWeekStartIST();
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

/**
 * Given a week start date and a day offset (0=Mon, 6=Sun),
 * returns a formatted date string like "Mon, Apr 28".
 */
export function getDayLabel(weekStart: Date, dayOffset: number): string {
  const date = new Date(weekStart);
  date.setDate(weekStart.getDate() + dayOffset);
  return date.toLocaleDateString("en-IN", {
    timeZone: IST_TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Returns current month number (1-12) in IST.
 */
export function getCurrentMonthIST(): number {
  return getNowIST().getMonth() + 1;
}

/**
 * Format a Date to a readable string in IST.
 */
export function formatDateIST(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    timeZone: IST_TIMEZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
