"use client";

import { useMemo } from "react";
import { C, PRODUCT_SEGMENTS } from "@/features/outlet-tracker/constants";
import type { Outlet } from "@/features/outlet-tracker/types";
import { fmtDate } from "@/features/outlet-tracker/utils";
import { tCompetitor, useT } from "@/features/i18n";
import {
  downloadCsv,
  flattenVisits,
  productsSummary,
  segmentTotals,
  toCsv,
  todayStamp,
} from "./reportUtils";
import { ReportShell, cell, headCell } from "./ReportShell";

export function VisitsReport({
  outlets,
  repNames,
}: {
  outlets: Outlet[];
  repNames: Record<string, string>;
}) {
  const { t } = useT();

  const rows = useMemo(() => flattenVisits(outlets), [outlets]);
  const repLabel = (phone: string) =>
    repNames[phone] ? `${repNames[phone]} (${phone})` : phone || "—";

  function onExport() {
    const headers = [
      "Date",
      "Rep",
      "Mobile (rep)",
      "Counter",
      "Counter Mobile",
      "Depot",
      "Area",
      "C&F",
      ...PRODUCT_SEGMENTS.flatMap((s) => [`${s} Sold`, `${s} Stock`]),
      "Total Sold",
      "Total Stock",
      "Rank",
      "Competitor",
      "Remarks",
    ];
    const data = rows.map((r) => {
      const seg = segmentTotals(r.items);
      return [
        r.date,
        repNames[r.rep] ?? "",
        r.rep,
        r.outletName,
        r.mobile,
        r.depot,
        r.area,
        r.headQuarter,
        ...PRODUCT_SEGMENTS.flatMap((s) => [seg[s].sold, seg[s].stock]),
        r.sold,
        r.stock,
        r.rank,
        tCompetitor(t, r.competitor, r.competitorBrand),
        r.remarks,
      ];
    });
    downloadCsv(`visits-${todayStamp()}.csv`, toCsv(headers, data));
  }

  return (
    <ReportShell
      title={t("admin.allVisitsTitle")}
      count={rows.length}
      onExport={onExport}
    >
      {rows.length === 0 ? (
        <div style={{ padding: 20, fontSize: 13, color: C.muted }}>
          {t("admin.reportEmpty")}
        </div>
      ) : (
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
          <thead>
            <tr>
              {[
                "Date",
                "Rep",
                "Counter",
                "Mobile",
                "Depot",
                "Area",
                "Products (sold/stock)",
                "Rank",
                "Competitor",
                "Remarks",
              ].map((h) => (
                <th key={h} style={headCell}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td style={cell}>{fmtDate(r.date)}</td>
                <td style={cell}>{repLabel(r.rep)}</td>
                <td style={{ ...cell, fontWeight: 700 }}>{r.outletName}</td>
                <td style={cell}>{r.mobile}</td>
                <td style={cell}>{r.depot}</td>
                <td style={cell}>{r.area}</td>
                <td style={cell}>{productsSummary(r.items)}</td>
                <td style={{ ...cell, textAlign: "center" }}>#{r.rank}</td>
                <td style={cell}>
                  {tCompetitor(t, r.competitor, r.competitorBrand)}
                </td>
                <td style={{ ...cell, whiteSpace: "normal", minWidth: 160 }}>
                  {r.remarks}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </ReportShell>
  );
}
