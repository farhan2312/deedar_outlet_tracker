import type { CompetitorLevel, Outlet } from "./types";

let counter = 0;
/** Best-effort unique id. Only used for records created at runtime. */
export function uid(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}${counter}`.toUpperCase();
}

export function fmtDate(d: string): string {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Keep only digits, capped at 10 (Indian mobile number). */
export function digits(v: string): string {
  return (v || "").replace(/[^0-9]/g, "").slice(0, 10);
}

export function matchOutlet(o: Outlet, q: string): boolean {
  const s = q.toLowerCase();
  return (
    o.name.toLowerCase().includes(s) ||
    o.mobile.includes(s) ||
    o.area.toLowerCase().includes(s) ||
    o.headQuarter.toLowerCase().includes(s)
  );
}

export interface DecoratedOutlet extends Outlet {
  typeLabel: string;
  gpsLabel: string;
  visitCount: number;
  lastVisitLabel: string;
  lastVisitDate: string;
}

export function decorateOutlet(o: Outlet): DecoratedOutlet {
  const sortedVisits = [...o.visits].sort((a, b) => b.date.localeCompare(a.date));
  const last = sortedVisits[0];
  return {
    ...o,
    typeLabel: o.type === "Other" ? o.typeOther || "Other" : o.type,
    gpsLabel: `${o.gps.lat}, ${o.gps.lng}`,
    visitCount: o.visits.length,
    lastVisitLabel: last ? fmtDate(last.date) : "No visits",
    lastVisitDate: last ? last.date : "",
  };
}

export function competitorSummary(
  level: CompetitorLevel | "",
  brand: string,
): string {
  if (level === "None" || !level) return "None";
  return `${level}${brand ? " — " + brand : ""}`;
}
