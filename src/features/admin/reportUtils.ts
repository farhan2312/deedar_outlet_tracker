import type { Outlet, VisitItem } from "@/features/outlet-tracker/types";
import { PRODUCT_SEGMENTS } from "@/features/outlet-tracker/constants";

/** A single visit flattened with its outlet context, for the visits report. */
export interface VisitReportRow {
  date: string;
  rep: string;
  outletName: string;
  mobile: string;
  depot: string;
  area: string;
  headQuarter: string;
  items: VisitItem[];
  stock: number;
  sold: number;
  rank: number;
  competitor: string;
  competitorBrand: string;
  remarks: string;
}

/** Flatten every outlet's visits into report rows, newest first. */
export function flattenVisits(outlets: Outlet[]): VisitReportRow[] {
  const rows: VisitReportRow[] = [];
  for (const o of outlets) {
    for (const v of o.visits) {
      rows.push({
        date: v.date,
        rep: v.rep,
        outletName: o.name,
        mobile: o.mobile,
        depot: o.depot,
        area: o.area,
        headQuarter: o.headQuarter,
        items: v.items,
        stock: v.stock,
        sold: v.sold,
        rank: v.rank,
        competitor: v.competitor,
        competitorBrand: v.competitorBrand,
        remarks: v.remarks,
      });
    }
  }
  return rows.sort(
    (a, b) => b.date.localeCompare(a.date) || a.outletName.localeCompare(b.outletName),
  );
}

/** Per-segment sold/stock for a visit's items, keyed by segment code. */
export function segmentTotals(items: VisitItem[]): Record<string, { sold: number; stock: number }> {
  const map: Record<string, { sold: number; stock: number }> = {};
  for (const seg of PRODUCT_SEGMENTS) map[seg] = { sold: 0, stock: 0 };
  for (const it of items) {
    if (it.segment && map[it.segment]) {
      map[it.segment].sold += it.sold;
      map[it.segment].stock += it.stock;
    }
  }
  return map;
}

/** Compact "DG10 4/12 · DB40 2/6" (sold/stock) summary of a visit's products. */
export function productsSummary(items: VisitItem[]): string {
  return items
    .filter((it) => it.segment)
    .map((it) => `${it.segment} ${it.sold}/${it.stock}`)
    .join(" · ");
}

const csvEscape = (v: string | number): string => {
  const s = String(v ?? "");
  return /["\n\r,]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Build a CSV string (CRLF rows) from a header row and data rows. */
export function toCsv(
  headers: string[],
  rows: (string | number)[][],
): string {
  return [headers, ...rows]
    .map((r) => r.map(csvEscape).join(","))
    .join("\r\n");
}

/** Trigger a client-side CSV download (BOM-prefixed so Excel reads UTF-8). */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(["﻿" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Today's date as YYYY-MM-DD (IST) for export filenames. */
export function todayStamp(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
