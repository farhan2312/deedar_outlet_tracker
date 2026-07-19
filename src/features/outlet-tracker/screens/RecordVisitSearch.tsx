"use client";

import { useMemo } from "react";
import { C } from "../constants";
import { useTracker } from "../store";
import { Badge, Card } from "../ui";
import { decorateOutlet, matchOutlet } from "../utils";

export function RecordVisitSearch() {
  const { state, onRvSearchChange, onSelectRvOutlet } = useTracker();

  const results = useMemo(() => {
    const outlets = state.outlets.map(decorateOutlet);
    return state.rvSearch
      ? outlets.filter((o) => matchOutlet(o, state.rvSearch))
      : outlets;
  }, [state.outlets, state.rvSearch]);

  return (
    <div style={{ padding: 20 }}>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 17,
          color: C.ink,
          marginBottom: 4,
        }}
      >
        Find the Outlet
      </div>
      <div style={{ fontSize: 13, color: C.sub, marginBottom: 14 }}>
        Search by name, mobile, town, or division.
      </div>
      <input
        className="dz-input dz-tap"
        value={state.rvSearch}
        onChange={onRvSearchChange}
        placeholder="Search outlets..."
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
      <div className="dz-card-list">
        {results.map((o) => (
          <Card key={o.id} onClick={() => onSelectRvOutlet(o.id)}>
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
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
              Last visit: {o.lastVisitLabel}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
