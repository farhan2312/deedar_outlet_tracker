"use client";

import { useMemo } from "react";
import { C } from "../constants";
import { useTracker } from "../store";
import { Badge, Button, Field, TextInput } from "../ui";
import { decorateOutlet } from "../utils";

export function AddVisitFind() {
  const { state, onAvMobileChange, onAvSelectOutlet, onAvGoAddOutlet } =
    useTracker();

  const match = useMemo(() => {
    if (state.avMobile.length !== 10) return null;
    const o = state.outlets.find((x) => x.mobile === state.avMobile);
    return o ? decorateOutlet(o) : null;
  }, [state.avMobile, state.outlets]);

  const notFound = state.avMobile.length === 10 && !match;

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
      <div style={{ fontSize: 13, color: C.sub, marginBottom: 16 }}>
        Enter the outlet&apos;s mobile number — we&apos;ll pull up its details.
      </div>

      <Field label="Outlet Mobile Number">
        <TextInput
          type="tel"
          inputMode="numeric"
          value={state.avMobile}
          onChange={onAvMobileChange}
          placeholder="10-digit mobile number"
        />
      </Field>

      {match ? (
        <div
          style={{
            background: "#fff",
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 14,
            marginTop: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>
              {match.name}
            </div>
            <Badge>{match.typeLabel}</Badge>
          </div>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>
            {match.town}, {match.division} · {match.mobile}
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
            Last visit: {match.lastVisitLabel}
          </div>
          <div style={{ marginTop: 14 }}>
            <Button onClick={() => onAvSelectOutlet(match.id)}>
              Continue to Visit Data
            </Button>
          </div>
        </div>
      ) : null}

      {notFound ? (
        <div
          style={{
            background: C.dangerBg,
            border: `1px solid ${C.dangerBorder}`,
            borderRadius: 10,
            padding: 14,
            marginTop: 16,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: C.danger }}>
            No outlet found
          </div>
          <div style={{ fontSize: 12, color: C.ink, marginTop: 4 }}>
            No outlet is registered with this mobile number yet.
          </div>
          <div style={{ marginTop: 12 }}>
            <Button variant="gold" onClick={onAvGoAddOutlet}>
              Add New Outlet
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
