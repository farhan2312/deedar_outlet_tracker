"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { C } from "@/features/outlet-tracker/constants";
import { useT } from "@/features/i18n";
import {
  AuthLayout,
  authButtonStyle,
  authFieldStyle,
  authLabelStyle,
} from "./AuthLayout";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const { t } = useT();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed.");
        return;
      }
      router.replace(next || "/");
      router.refresh();
    } catch {
      setError(t("login.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title={t("login.title")}
      subtitle={t("login.subtitle")}
      footer={
        <>
          {t("login.newRep")}{" "}
          <Link href="/signup" style={{ color: "#fff", fontWeight: 700 }}>
            {t("login.createAccount")}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit}>
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

        <label style={authLabelStyle}>{t("field.password")}</label>
        <input
          className="dz-input dz-tap"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("field.password")}
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
          {busy ? t("login.signingIn") : t("login.button")}
        </button>
      </form>
    </AuthLayout>
  );
}
