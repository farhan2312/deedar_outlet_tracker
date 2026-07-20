"use client";

import { useState } from "react";
import Link from "next/link";
import { C, USER_DIVISIONS } from "@/features/outlet-tracker/constants";
import { useT } from "@/features/i18n";
import {
  AuthLayout,
  authButtonStyle,
  authFieldStyle,
  authLabelStyle,
} from "./AuthLayout";

export function SignupForm() {
  const { t } = useT();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"field_rep" | "admin">("field_rep");
  const [division, setDivision] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, role, division, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sign up failed.");
        return;
      }
      setDone(true);
    } catch {
      setError(t("login.error"));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <AuthLayout
        title={t("signup.doneTitle")}
        subtitle={t("signup.doneSubtitle")}
        footer={
          <Link href="/login" style={{ color: "#fff", fontWeight: 700 }}>
            {t("signup.backToLogin")}
          </Link>
        }
      >
        <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.5 }}>
          {t("signup.doneBody", { name: name || "" })}
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={t("signup.title")}
      subtitle={t("signup.subtitle")}
      footer={
        <>
          {t("signup.haveAccount")}{" "}
          <Link href="/login" style={{ color: "#fff", fontWeight: 700 }}>
            {t("signup.login")}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit}>
        <label style={authLabelStyle}>{t("field.fullName")}</label>
        <input
          className="dz-input dz-tap"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("field.namePlaceholder")}
          style={authFieldStyle}
        />

        <label style={authLabelStyle}>{t("field.mobile")}</label>
        <input
          className="dz-input dz-tap"
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))
          }
          placeholder={t("field.mobilePlaceholder")}
          style={authFieldStyle}
        />

        <label style={authLabelStyle}>{t("field.role")}</label>
        <select
          className="dz-input dz-tap"
          value={role}
          onChange={(e) => setRole(e.target.value as "field_rep" | "admin")}
          style={{ ...authFieldStyle, appearance: "auto", background: "#fff" }}
        >
          <option value="field_rep">{t("role.field_rep")}</option>
          <option value="admin">{t("role.admin")}</option>
        </select>

        {role === "field_rep" ? (
          <>
            <label style={authLabelStyle}>{t("field.division")}</label>
            <select
              className="dz-input dz-tap"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              style={{ ...authFieldStyle, appearance: "auto", background: "#fff" }}
            >
              <option value="">{t("field.divisionSelect")}</option>
              {USER_DIVISIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </>
        ) : null}

        <label style={authLabelStyle}>{t("field.password")}</label>
        <input
          className="dz-input dz-tap"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("field.passwordMin")}
          style={{ ...authFieldStyle, marginBottom: 6 }}
        />

        {error ? (
          <div style={{ fontSize: 12, color: C.danger, margin: "6px 0 4px" }}>
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="dz-tap dz-btn-green"
          style={{ ...authButtonStyle, opacity: busy ? 0.6 : 1 }}
        >
          {busy ? t("signup.creating") : t("signup.button")}
        </button>
      </form>
    </AuthLayout>
  );
}
