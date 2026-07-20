"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { C } from "@/features/outlet-tracker/constants";
import { useT } from "@/features/i18n";
import {
  AuthLayout,
  authButtonStyle,
  authFieldStyle,
  authLabelStyle,
} from "./AuthLayout";

export function ChangePasswordForm({ forced }: { forced: boolean }) {
  const router = useRouter();
  const { t } = useT();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError(t("cp.mismatch"));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not update password.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError(t("login.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title={forced ? t("cp.titleForced") : t("cp.title")}
      subtitle={forced ? t("cp.subtitleForced") : t("cp.subtitle")}
    >
      <form onSubmit={onSubmit}>
        <label style={authLabelStyle}>{t("cp.newPassword")}</label>
        <input
          className="dz-input dz-tap"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("field.passwordMin")}
          style={authFieldStyle}
        />

        <label style={authLabelStyle}>{t("cp.confirm")}</label>
        <input
          className="dz-input dz-tap"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={t("cp.confirmPlaceholder")}
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
          {busy ? t("cp.saving") : t("cp.save")}
        </button>
      </form>
    </AuthLayout>
  );
}
