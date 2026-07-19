"use client";

import Link from "next/link";
import type { Screen } from "./types";
import { C } from "./constants";
import { TrackerProvider, useTracker, type SessionUser } from "./store";
import { Dashboard } from "./screens/Dashboard";
import { OutletDetail } from "./screens/OutletDetail";
import { AddOutlet } from "./screens/AddOutlet";
import { RecordVisitSearch } from "./screens/RecordVisitSearch";
import { RecordVisit } from "./screens/RecordVisit";
import { EditVisit } from "./screens/EditVisit";

const TITLES: Record<Screen, string> = {
  login: "Deedar Field",
  dashboard: "Deedar Field",
  outletDetail: "Outlet Details",
  addOutlet: "Add New Outlet",
  recordVisitSearch: "Record Visit",
  recordVisit: "Record Visit",
  editVisit: "Update Visit",
};

export function OutletTracker({ user }: { user: SessionUser }) {
  return (
    <TrackerProvider user={user}>
      <Shell />
    </TrackerProvider>
  );
}

function Shell() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        background: C.cream,
      }}
    >
      <div
        className="dz-shell"
        style={{
          width: "100%",
          minHeight: "100dvh",
          background: C.panel,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          boxShadow: "0 0 40px rgba(0,0,0,0.08)",
        }}
      >
        <AppShell />
        <Toast />
      </div>
    </div>
  );
}

function AppShell() {
  const { state, user, onBack } = useTracker();
  const showBack = state.screen !== "dashboard";
  const showLogo = state.screen === "dashboard";

  return (
    <>
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
          zIndex: 10,
        }}
      >
        {showBack ? (
          <button
            onClick={onBack}
            aria-label="Back"
            className="dz-tap"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              background: "rgba(255,255,255,0.12)",
              border: "none",
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderLeft: "2px solid #fff",
                borderBottom: "2px solid #fff",
                transform: "rotate(45deg)",
                marginLeft: 3,
                display: "block",
              }}
            />
          </button>
        ) : null}
        {showLogo ? (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: C.gold,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 15,
                color: C.green,
              }}
            >
              D
            </span>
          </div>
        ) : null}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {TITLES[state.screen]}
          </div>
        </div>
        {state.screen === "dashboard" && user.role === "admin" ? (
          <Link
            href="/admin"
            style={{ fontSize: 12, color: C.greenTint, fontWeight: 600 }}
          >
            Admin
          </Link>
        ) : null}
        {state.screen === "dashboard" ? <LogoutButton /> : null}
      </header>

      <main style={{ flex: 1, paddingBottom: 90 }}>
        {state.loading ? (
          <div style={{ padding: 20, fontSize: 13, color: C.sub }}>Loading…</div>
        ) : (
          <ScreenBody screen={state.screen} />
        )}
      </main>
    </>
  );
}

function LogoutButton() {
  const { onLogout } = useTracker();
  return (
    <button
      onClick={onLogout}
      className="dz-tap"
      style={{
        fontSize: 12,
        color: C.greenTint,
        cursor: "pointer",
        textDecoration: "underline",
        background: "none",
        border: "none",
      }}
    >
      Logout
    </button>
  );
}

function ScreenBody({ screen }: { screen: Screen }) {
  switch (screen) {
    case "dashboard":
      return <Dashboard />;
    case "outletDetail":
      return <OutletDetail />;
    case "addOutlet":
      return <AddOutlet />;
    case "recordVisitSearch":
      return <RecordVisitSearch />;
    case "recordVisit":
      return <RecordVisit />;
    case "editVisit":
      return <EditVisit />;
    default:
      return null;
  }
}

function Toast() {
  const { state } = useTracker();
  if (!state.toast) return null;
  return (
    <div
      role="status"
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: C.ink,
        color: "#fff",
        padding: "12px 20px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        animation: "toastIn 0.25s ease-out",
        zIndex: 50,
        whiteSpace: "nowrap",
        boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
      }}
    >
      {state.toast}
    </div>
  );
}
