"use client";

import { useState } from "react";
import Link from "next/link";
import { C, USER_DIVISIONS } from "@/features/outlet-tracker/constants";
import {
  AuthLayout,
  authButtonStyle,
  authFieldStyle,
  authLabelStyle,
} from "./AuthLayout";

export function SignupForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
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
        body: JSON.stringify({ name, phone, division, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sign up failed.");
        return;
      }
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <AuthLayout
        title="Request received"
        subtitle="Your account is pending approval"
        footer={
          <Link href="/login" style={{ color: "#fff", fontWeight: 700 }}>
            Back to login
          </Link>
        }
      >
        <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.5 }}>
          Thanks, {name || "there"}. An admin will review your request and
          approve your access. You&apos;ll be able to log in once approved.
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Sign up to request rep access"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#fff", fontWeight: 700 }}>
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit}>
        <label style={authLabelStyle}>Full Name</label>
        <input
          className="dz-input dz-tap"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          style={authFieldStyle}
        />

        <label style={authLabelStyle}>Mobile Number</label>
        <input
          className="dz-input dz-tap"
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))
          }
          placeholder="10-digit mobile number"
          style={authFieldStyle}
        />

        <label style={authLabelStyle}>Division</label>
        <select
          className="dz-input dz-tap"
          value={division}
          onChange={(e) => setDivision(e.target.value)}
          style={{ ...authFieldStyle, appearance: "auto", background: "#fff" }}
        >
          <option value="">Select your division</option>
          {USER_DIVISIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <label style={authLabelStyle}>Password</label>
        <input
          className="dz-input dz-tap"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
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
          {busy ? "Creating…" : "Create Account"}
        </button>
      </form>
    </AuthLayout>
  );
}
