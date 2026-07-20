"use client";

import type { ReactNode } from "react";
import { C } from "@/features/outlet-tracker/constants";
import { LanguageToggle, useT } from "@/features/i18n";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { t } = useT();
  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 24px",
        background: `linear-gradient(180deg, ${C.green} 0%, ${C.greenDark} 100%)`,
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: 16, right: 16 }}>
        <LanguageToggle tone="dark" />
      </div>
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: 20,
          background: C.gold,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 32,
            color: C.green,
          }}
        >
          D
        </span>
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 26,
          color: "#fff",
          letterSpacing: 0.5,
        }}
      >
        DEEDAR
      </div>
      <div
        style={{
          fontSize: 13,
          color: C.greenTint,
          marginTop: 4,
          letterSpacing: 1.5,
          textTransform: "uppercase",
        }}
      >
        {t("brand.tagline")}
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 360,
          background: "#fff",
          borderRadius: 16,
          padding: "26px 22px",
          marginTop: 32,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 18,
            color: C.ink,
            marginBottom: 4,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 13, color: C.sub, marginBottom: 20 }}>
          {subtitle}
        </div>
        {children}
      </div>

      {footer ? (
        <div
          style={{
            fontSize: 13,
            color: C.greenTint,
            marginTop: 22,
            textAlign: "center",
          }}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
}

export const authFieldStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "13px 14px",
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  fontSize: 15,
  outline: "none",
  marginBottom: 14,
};

export const authLabelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: C.ink,
  display: "block" as const,
  marginBottom: 6,
};

export const authButtonStyle = {
  width: "100%",
  padding: 14,
  background: C.green,
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontSize: 15,
  fontWeight: 700,
  marginTop: 6,
  cursor: "pointer",
};
