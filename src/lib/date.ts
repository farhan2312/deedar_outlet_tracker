/**
 * Today's calendar date in India (Asia/Kolkata), as YYYY-MM-DD.
 *
 * Never rely on Postgres's `current_date` for this — the DB session runs in
 * UTC, which lags IST by 5.5 hours. Between 12:00 AM and 5:30 AM IST, UTC is
 * still on the previous calendar day, so `current_date` would record
 * yesterday's date for visits logged in that window.
 */
export function todayIST(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}
