import type { CompetitorLevel, Outlet, VisitItem, VisitItemForm } from "./types";

/** Form product lines → domain items, dropping lines with no segment chosen. */
export function parseVisitItems(items: VisitItemForm[]): VisitItem[] {
  return items
    .filter((it) => it.segment)
    .map((it) => ({
      segment: it.segment,
      stock: Number(it.stock) || 0,
      sold: Number(it.sold) || 0,
      rank: Number(it.rank) || 0,
    }));
}

/** Visit-level totals from its product lines: stock/sold summed, rank = best. */
export function visitTotals(items: VisitItem[]): {
  stock: number;
  sold: number;
  rank: number;
} {
  const stock = items.reduce((s, it) => s + it.stock, 0);
  const sold = items.reduce((s, it) => s + it.sold, 0);
  const ranks = items.map((it) => it.rank).filter((r) => r > 0);
  const rank = ranks.length ? Math.min(...ranks) : 0;
  return { stock, sold, rank };
}

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
