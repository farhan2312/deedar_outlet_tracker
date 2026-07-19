"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { C } from "@/features/outlet-tracker/constants";
import {
  AuthLayout,
  authButtonStyle,
  authFieldStyle,
  authLabelStyle,
} from "./AuthLayout";

export function ChangePasswordForm({ forced }: { forced: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
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
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title={forced ? "Set a New Password" : "Change Password"}
      subtitle={
        forced
          ? "For your security, please replace the temporary password"
          : "Choose a new password"
      }
    >
      <form onSubmit={onSubmit}>
        <label style={authLabelStyle}>New Password</label>
        <input
          className="dz-input dz-tap"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          style={authFieldStyle}
        />

        <label style={authLabelStyle}>Confirm New Password</label>
        <input
          className="dz-input dz-tap"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-enter new password"
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
          {busy ? "Saving…" : "Save Password"}
        </button>
      </form>
    </AuthLayout>
  );
}
