"use client";

import { C } from "../constants";
import { useTracker } from "../store";

export function Login() {
  const { state, onAuthMobileChange, onAuthPasswordChange, onLogin } =
    useTracker();

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 28px",
        background: `linear-gradient(180deg, ${C.green} 0%, ${C.greenDark} 100%)`,
        minHeight: "100vh",
      }}
    >
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
        Field Outlet Tracker
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onLogin();
        }}
        style={{
          width: "100%",
          maxWidth: 340,
          background: "#fff",
          borderRadius: 16,
          padding: "26px 22px",
          marginTop: 36,
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
          Rep Login
        </div>
        <div style={{ fontSize: 13, color: C.sub, marginBottom: 20 }}>
          Sign in with your mobile number
        </div>

        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: C.ink,
            display: "block",
            marginBottom: 6,
          }}
        >
          Mobile Number
        </label>
        <input
          className="dz-input dz-tap"
          type="tel"
          inputMode="numeric"
          value={state.authMobile}
          onChange={onAuthMobileChange}
          placeholder="10-digit mobile number"
          style={inputStyle}
        />

        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: C.ink,
            display: "block",
            margin: "10px 0 6px",
          }}
        >
          Password
        </label>
        <input
          className="dz-input dz-tap"
          type="password"
          value={state.authPassword}
          onChange={onAuthPasswordChange}
          placeholder="Password"
          style={{ ...inputStyle, marginBottom: 6 }}
        />

        {state.authError ? (
          <div style={{ fontSize: 12, color: C.danger, marginBottom: 10 }}>
            {state.authError}
          </div>
        ) : null}

        <button
          type="submit"
          className="dz-tap dz-btn-green"
          style={{
            width: "100%",
            padding: 14,
            background: C.green,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 700,
            marginTop: 10,
            cursor: "pointer",
          }}
        >
          Log In
        </button>
      </form>
      <div
        style={{
          fontSize: 11,
          color: "#9BC2AB",
          marginTop: 22,
          textAlign: "center",
        }}
      >
        Demo password: deedar12345
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "13px 14px",
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  fontSize: 15,
  outline: "none",
};
