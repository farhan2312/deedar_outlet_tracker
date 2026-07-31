"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { C } from "@/features/outlet-tracker/constants";
import { LanguageToggle, useT } from "@/features/i18n";

export const headCell: CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: 11,
  fontWeight: 700,
  color: C.sub,
  textTransform: "uppercase",
  letterSpacing: 0.4,
  borderBottom: `2px solid ${C.border}`,
  background: C.panel,
  whiteSpace: "nowrap",
  position: "sticky",
  top: 0,
};

export const cell: CSSProperties = {
  padding: "9px 12px",
  color: C.ink,
  borderBottom: `1px solid ${C.border}`,
  whiteSpace: "nowrap",
};

export function ReportShell({
  title,
  count,
  onExport,
  children,
}: {
  title: string;
  count: number;
  onExport: () => void;
  children: ReactNode;
}) {
  const { t } = useT();
  return (
    <div style={{ minHeight: "100svh", background: C.cream }}>
      <header
        style={{
          background: C.green,
          color: "#fff",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <Link
          href="/admin"
          style={{ fontSize: 13, color: C.greenTint, fontWeight: 700 }}
        >
          {t("admin.backToAdmin")}
        </Link>
        <div
          style={{
            flex: 1,
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {title}
        </div>
        <LanguageToggle tone="dark" />
      </header>

      <div
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ flex: 1, fontSize: 13, color: C.sub }}>
          {t("admin.records", { count })}
        </div>
        <button
          onClick={onExport}
          disabled={count === 0}
          className="dz-tap"
          style={{
            background: C.gold,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 16px",
            fontSize: 13,
            fontWeight: 700,
            cursor: count === 0 ? "not-allowed" : "pointer",
            opacity: count === 0 ? 0.5 : 1,
          }}
        >
          {t("admin.export")}
        </button>
      </div>

      <div style={{ padding: "0 20px 40px" }}>
        <div
          style={{
            background: "#fff",
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            overflowX: "auto",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
