"use client";

import { useMemo } from "react";
import { C, DAY_MS } from "../constants";
import { useTracker } from "../store";
import { Badge, Card, SectionLabel } from "../ui";
import { decorateOutlet, matchOutlet } from "../utils";
import { tType, useT } from "@/features/i18n";

export function Dashboard() {
  const {
    state,
    user,
    openOutlet,
    onDashSearchChange,
    onStartAddOutlet,
    onStartAddVisit,
  } = useTracker();
  const { t } = useT();

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

  // All outlets (admin view), most-recently-visited first.
  const allOutlets = useMemo(
    () =>
      [...outlets].sort(
        (a, b) =>
          b.lastVisitDate.localeCompare(a.lastVisitDate) ||
          a.name.localeCompare(b.name),
      ),
    [outlets],
  );

  // The rep's own submissions still inside the 24h edit window, grouped by
  // outlet so an outlet with two recent visits shows once.
  const mySubmissions = useMemo(() => {
    const now = Date.now();
    const byOutlet = new Map<
      string,
      { outletId: string; outletName: string; count: number; latestLoggedAt: number }
    >();
    outlets.forEach((o) => {
      o.visits.forEach((v) => {
        if (
          v.rep === state.repMobile &&
          v.loggedAt &&
          now - v.loggedAt < DAY_MS
        ) {
          const entry = byOutlet.get(o.id) ?? {
            outletId: o.id,
            outletName: o.name,
            count: 0,
            latestLoggedAt: 0,
          };
          entry.count += 1;
          entry.latestLoggedAt = Math.max(entry.latestLoggedAt, v.loggedAt);
          byOutlet.set(o.id, entry);
        }
      });
    });
    return [...byOutlet.values()]
      .map((e) => ({
        ...e,
        hoursLeft: Math.max(
          1,
          Math.ceil((DAY_MS - (now - e.latestLoggedAt)) / (60 * 60 * 1000)),
        ),
      }))
      .sort((a, b) => b.latestLoggedAt - a.latestLoggedAt);
  }, [outlets, state.repMobile]);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontSize: 13, color: C.sub, marginBottom: 2 }}>
        {t("dash.welcome")}
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
        placeholder={t("dash.searchPlaceholder")}
        aria-label={t("dash.searchPlaceholder")}
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
          <SectionLabel>
            {t("dash.searchResults", { count: dashResults.length })}
          </SectionLabel>
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
                  <Badge>{tType(t, o.typeLabel)}</Badge>
                </div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>
                  {o.area}, {o.headQuarter} · {o.mobile}
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
          title={t("dash.addOutlet")}
          subtitle={t("dash.addOutletSub")}
          subtitleColor={C.greenTint}
          icon="plus"
        />
        {user.role !== "SO" ? (
          <ActionCard
            onClick={onStartAddVisit}
            bg={C.gold}
            title={t("dash.addVisit")}
            subtitle={t("dash.addVisitSub")}
            subtitleColor={C.goldBg}
            icon="check"
          />
        ) : null}
      </div>

      {mySubmissions.length > 0 ? (
        <div style={{ marginBottom: 4 }}>
          <SectionLabel>{t("dash.mySubmissions")}</SectionLabel>
          <div className="dz-card-list" style={{ marginBottom: 20 }}>
            {mySubmissions.map((s) => (
              <Card key={s.outletId} onClick={() => openOutlet(s.outletId)}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>
                    {s.outletName}
                  </div>
                  <Badge tone="green">{t("badge.edit")}</Badge>
                </div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>
                  {t("dash.visitsInLast24", { count: s.count })}
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                  {t("dash.editableHours", { hours: s.hoursLeft })}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      {user.role === "admin" ? (
        <>
          <SectionLabel>
            {t("dash.allOutlets", { count: allOutlets.length })}
          </SectionLabel>
          {allOutlets.length === 0 ? (
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
              {t("dash.noOutlets")}
            </div>
          ) : (
            <div className="dz-card-list">
              {allOutlets.map((o) => (
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
                    <Badge>{tType(t, o.typeLabel)}</Badge>
                  </div>
                  <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>
                    {o.area}, {o.headQuarter}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                    {t("dash.visitsCountLast", {
                      count: o.visitCount,
                      date: o.lastVisitLabel,
                    })}
                  </div>
                </Card>
              ))}
            </div>
          )}
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
