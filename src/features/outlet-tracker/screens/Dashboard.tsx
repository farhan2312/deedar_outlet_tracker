"use client";

import { useMemo } from "react";
import { C, DAY_MS } from "../constants";
import { useTracker } from "../store";
import { Badge, Card, SectionLabel } from "../ui";
import { decorateOutlet, matchOutlet } from "../utils";

export function Dashboard() {
  const {
    state,
    user,
    openOutlet,
    onDashSearchChange,
    onStartAddOutlet,
    onStartRecordVisit,
    onOpenEditVisit,
  } = useTracker();

  const outlets = useMemo(
    () => state.outlets.map(decorateOutlet),
    [state.outlets],
  );

  const dashResults = useMemo(
    () =>
      state.dashSearch
        ? outlets.filter((o) => matchOutlet(o, state.dashSearch)).slice(0, 5)
        : [],
    [outlets, state.dashSearch],
  );

  const recentOutlets = useMemo(
    () =>
      [...outlets]
        .sort((a, b) => b.lastVisitDate.localeCompare(a.lastVisitDate))
        .slice(0, 5),
    [outlets],
  );

  const recentSubmissions = useMemo(() => {
    const now = Date.now();
    const subs: {
      key: string;
      outletName: string;
      loggedLabel: string;
      hoursLeft: number;
      loggedAt: number;
      onEdit: () => void;
    }[] = [];
    state.outlets.forEach((o) => {
      o.visits.forEach((v) => {
        if (v.rep === state.repMobile && v.loggedAt && now - v.loggedAt < DAY_MS) {
          subs.push({
            key: v.id,
            outletName: o.name,
            loggedLabel: new Date(v.loggedAt).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }),
            hoursLeft: Math.max(
              1,
              Math.ceil((DAY_MS - (now - v.loggedAt)) / (60 * 60 * 1000)),
            ),
            loggedAt: v.loggedAt,
            onEdit: () => onOpenEditVisit(o.id, v),
          });
        }
      });
    });
    return subs.sort((a, b) => b.loggedAt - a.loggedAt);
  }, [state.outlets, state.repMobile, onOpenEditVisit]);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontSize: 13, color: C.sub, marginBottom: 2 }}>
        Welcome back
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 20,
          color: C.ink,
          marginBottom: 18,
        }}
      >
        {user.name}
      </div>

      <input
        className="dz-input dz-tap"
        value={state.dashSearch}
        onChange={onDashSearchChange}
        placeholder="Search outlets by name, mobile, town..."
        aria-label="Search outlets"
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "13px 14px",
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          fontSize: 14,
          marginBottom: 16,
          outline: "none",
          background: "#fff",
        }}
      />

      {state.dashSearch ? (
        <div style={{ marginBottom: 20 }}>
          <SectionLabel>Search Results ({dashResults.length})</SectionLabel>
          <div className="dz-card-list">
            {dashResults.map((o) => (
              <Card key={o.id} onClick={() => openOutlet(o.id)}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>
                    {o.name}
                  </div>
                  <Badge>{o.typeLabel}</Badge>
                </div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>
                  {o.town}, {o.division} · {o.mobile}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <ActionCard
          onClick={onStartAddOutlet}
          bg={C.green}
          title="Add New Outlet"
          subtitle="Onboard a new outlet"
          subtitleColor={C.greenTint}
          icon="plus"
        />
          <ActionCard
            onClick={onStartRecordVisit}
            bg={C.gold}
            title="Record Visit"
            subtitle="Update existing outlet"
            subtitleColor={C.goldBg}
            icon="check"
          />
  
      </div>

      {recentSubmissions.length > 0 ? (
        <div style={{ marginBottom: 4 }}>
          <SectionLabel>My Submissions (editable for 24h)</SectionLabel>
          <div className="dz-card-list" style={{ marginBottom: 20 }}>
            {recentSubmissions.map((v) => (
              <Card key={v.key} onClick={v.onEdit}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>
                    {v.outletName}
                  </div>
                  <Badge tone="green">Edit</Badge>
                </div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>
                  Logged {v.loggedLabel}
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                  Editable for {v.hoursLeft} more hours
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      {user.role === "admin" ? (
        <>
          <SectionLabel>Quick Access</SectionLabel>
          {recentOutlets.length === 0 ? (
            <div
              style={{
                background: "#fff",
                border: `1px dashed ${C.border}`,
                borderRadius: 12,
                padding: 18,
                fontSize: 13,
                color: C.sub,
                textAlign: "center",
              }}
            >
              No outlets yet. Tap{" "}
              <strong style={{ color: C.ink }}>Add New Outlet</strong> to
              onboard your first one.
            </div>
          ) : null}
          <div className="dz-card-list">
            {recentOutlets.map((o) => (
              <Card key={o.id} onClick={() => openOutlet(o.id)}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>
                    {o.name}
                  </div>
                  <Badge>{o.typeLabel}</Badge>
                </div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>
                  {o.town}, {o.division}
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function ActionCard({
  onClick,
  bg,
  title,
  subtitle,
  subtitleColor,
  icon,
}: {
  onClick: () => void;
  bg: string;
  title: string;
  subtitle: string;
  subtitleColor: string;
  icon: "plus" | "check";
}) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="dz-tap"
      style={{
        flex: 1,
        background: bg,
        borderRadius: 14,
        padding: "18px 14px",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: "rgba(255,255,255,0.15)",
          position: "relative",
          marginBottom: 10,
        }}
      >
        {icon === "plus" ? (
          <>
            <span style={barStyle(14, 2)} />
            <span style={barStyle(2, 14)} />
          </>
        ) : (
          <>
            <span
              style={{
                position: "absolute",
                left: 6,
                top: 14,
                width: 6,
                height: 2,
                background: "#fff",
                transform: "rotate(45deg)",
              }}
            />
            <span
              style={{
                position: "absolute",
                left: 10,
                top: 15,
                width: 12,
                height: 2,
                background: "#fff",
                transform: "rotate(-45deg)",
              }}
            />
          </>
        )}
      </div>
      <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{title}</div>
      <div style={{ color: subtitleColor, fontSize: 11, marginTop: 2 }}>
        {subtitle}
      </div>
    </div>
  );
}

function barStyle(w: number, h: number) {
  return {
    position: "absolute" as const,
    left: "50%",
    top: "50%",
    width: w,
    height: h,
    background: "#fff",
    transform: "translate(-50%,-50%)",
  };
}
