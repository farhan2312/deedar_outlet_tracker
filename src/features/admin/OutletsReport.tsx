"use client";

import { useMemo } from "react";
import { C } from "@/features/outlet-tracker/constants";
import type { Outlet } from "@/features/outlet-tracker/types";
import { fmtDate } from "@/features/outlet-tracker/utils";
import { useT } from "@/features/i18n";
import { downloadCsv, toCsv, todayStamp } from "./reportUtils";
import { ReportShell, cell, headCell } from "./ReportShell";

function typeLabel(o: Outlet): string {
  return o.type === "Other" ? o.typeOther || "Other" : o.type;
}

function lastVisit(o: Outlet): string {
  const dates = o.visits.map((v) => v.date).sort();
  return dates.length ? dates[dates.length - 1] : "";
}

export function OutletsReport({ outlets }: { outlets: Outlet[] }) {
  const { t } = useT();

  const rows = useMemo(
    () =>
      [...outlets].sort(
        (a, b) => a.name.localeCompare(b.name) || a.mobile.localeCompare(b.mobile),
      ),
    [outlets],
  );

  function onExport() {
    const headers = [
      "Name",
      "Mobile",
      "Type",
      "Depot",
      "Area",
      "C&F",
      "Address",
      "Latitude",
      "Longitude",
      "Visits",
      "Last Visit",
    ];
    const data = rows.map((o) => [
      o.name,
      o.mobile,
      typeLabel(o),
      o.depot,
      o.area,
      o.headQuarter,
      o.address,
      o.gps.lat,
      o.gps.lng,
      o.visits.length,
      lastVisit(o),
    ]);
    downloadCsv(`counters-${todayStamp()}.csv`, toCsv(headers, data));
  }

  return (
    <ReportShell
      title={t("admin.allOutletsTitle")}
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
                "Name",
                "Mobile",
                "Type",
                "Depot",
                "Area",
                "Visits",
                "Last Visit",
              ].map((h) => (
                <th key={h} style={headCell}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                <td style={{ ...cell, fontWeight: 700 }}>{o.name}</td>
                <td style={cell}>{o.mobile}</td>
                <td style={cell}>{typeLabel(o)}</td>
                <td style={cell}>{o.depot}</td>
                <td style={cell}>{o.area}</td>
                <td style={{ ...cell, textAlign: "center" }}>{o.visits.length}</td>
                <td style={cell}>
                  {lastVisit(o) ? fmtDate(lastVisit(o)) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </ReportShell>
  );
}
