"use client";

import { useMemo } from "react";
import { C, DAY_MS, TYPES } from "../constants";
import { useTracker } from "../store";
import { Badge, Button, Field, FieldGrid, SectionLabel, Select, TextInput } from "../ui";
import { competitorSummary, decorateOutlet, fmtDate } from "../utils";

export function OutletDetail() {
  const {
    state,
    user,
    onEditIdentity,
    onCancelEditIdentity,
    setEditIdentity,
    saveEditIdentity,
    onAddVisitForSelected,
    onOpenEditVisit,
  } = useTracker();

  const outlet = useMemo(() => {
    const o = state.outlets.find((x) => x.id === state.selectedOutletId);
    return o ? decorateOutlet(o) : null;
  }, [state.outlets, state.selectedOutletId]);

  const visitHistory = useMemo(() => {
    if (!outlet) return [];
    return [...outlet.visits].sort(
      (a, b) =>
        b.date.localeCompare(a.date) || (b.loggedAt ?? 0) - (a.loggedAt ?? 0),
    );
  }, [outlet]);

  // A field rep's own visits still within the 24h edit window.
  const myEditable = useMemo(() => {
    if (!outlet || user.role === "admin") return [];
    const now = Date.now();
    return [...outlet.visits]
      .filter(
        (v) => v.rep === user.phone && v.loggedAt && now - v.loggedAt < DAY_MS,
      )
      .sort((a, b) => (b.loggedAt ?? 0) - (a.loggedAt ?? 0));
  }, [outlet, user.role, user.phone]);

  if (!outlet) return null;

  const isAdmin = user.role === "admin";

  const editing = state.editingIdentity;
  const ef = state.editForm;
  const editIsOther = ef.type === "Other";

  return (
    <div style={{ padding: 20 }}>
      <div
        style={{
          background: "#fff",
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: 18,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 18,
                color: C.ink,
              }}
            >
              {outlet.name}
            </div>
            <div style={{ marginTop: 6 }}>
              <Badge>{outlet.typeLabel}</Badge>
            </div>
          </div>
          {!editing ? (
            <div
              onClick={onEditIdentity}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onEditIdentity();
                }
              }}
              className="dz-tap"
              style={{
                fontSize: 12,
                color: C.green,
                fontWeight: 700,
                cursor: "pointer",
                border: `1px solid ${C.green}`,
                borderRadius: 8,
                padding: "6px 10px",
                whiteSpace: "nowrap",
              }}
            >
              Edit
            </div>
          ) : null}
        </div>

        {!editing ? (
          <div
            style={{
              marginTop: 14,
              display: "flex",
              flexDirection: "column",
              gap: 9,
            }}
          >
            <Detail label="Point of Contact" value={outlet.poc} />
            <Detail label="Mobile" value={outlet.mobile} />
            <Detail label="Address" value={outlet.address} />
            <Detail
              label="Town/Division"
              value={`${outlet.town}, ${outlet.division}`}
            />
            <Detail label="GPS" value={outlet.gpsLabel} />
          </div>
        ) : (
          <div
            style={{
              marginTop: 14,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <Field label="Outlet Name">
              <TextInput
                value={ef.name ?? ""}
                onChange={(e) => setEditIdentity({ name: e.target.value })}
              />
            </Field>
            <Field label="Point of Contact">
              <TextInput
                value={ef.poc ?? ""}
                onChange={(e) => setEditIdentity({ poc: e.target.value })}
              />
            </Field>
            <Field label="Mobile Number">
              <TextInput
                value={ef.mobile ?? ""}
                inputMode="numeric"
                onChange={(e) => setEditIdentity({ mobile: e.target.value })}
              />
            </Field>
            <Field label="Address">
              <TextInput
                value={ef.address ?? ""}
                onChange={(e) => setEditIdentity({ address: e.target.value })}
              />
            </Field>
            <FieldGrid>
              <Field label="Town/City">
                <TextInput
                  value={ef.town ?? ""}
                  onChange={(e) => setEditIdentity({ town: e.target.value })}
                />
              </Field>
              <Field label="Division">
                <TextInput
                  value={ef.division ?? ""}
                  onChange={(e) => setEditIdentity({ division: e.target.value })}
                />
              </Field>
            </FieldGrid>
            <Field label="Type of Outlet">
              <Select
                value={ef.type ?? ""}
                onChange={(e) => setEditIdentity({ type: e.target.value })}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            {editIsOther ? (
              <TextInput
                value={ef.typeOther ?? ""}
                onChange={(e) => setEditIdentity({ typeOther: e.target.value })}
                placeholder="Specify outlet type"
              />
            ) : null}
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <Button variant="ghost" onClick={onCancelEditIdentity}>
                Cancel
              </Button>
              <Button onClick={saveEditIdentity}>Save Changes</Button>
            </div>
          </div>
        )}
      </div>

      <Button variant="gold" onClick={onAddVisitForSelected}>
        Add Visit for this Outlet
      </Button>

      {isAdmin ? (
        <div style={{ marginTop: 24 }}>
          <SectionLabel>Visit History ({visitHistory.length})</SectionLabel>
          {visitHistory.length === 0 ? (
            <div style={{ fontSize: 13, color: C.muted }}>
              No visits recorded for this outlet yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {visitHistory.map((v) => (
                <div
                  key={v.id}
                  style={{
                    background: "#fff",
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: 14,
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
                    <div style={{ fontWeight: 700, fontSize: 13, color: C.ink }}>
                      {fmtDate(v.date)}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted }}>
                      Rep {v.rep || "—"}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: C.ink, marginTop: 5 }}>
                    Stock {v.stock} · Sold {v.sold} · Rank #{v.rank}
                  </div>
                  <div style={{ fontSize: 11, color: C.sub, marginTop: 3 }}>
                    Competitor:{" "}
                    {competitorSummary(v.competitor, v.competitorBrand)}
                  </div>
                  {v.remarks ? (
                    <div style={{ fontSize: 11, color: C.sub, marginTop: 3 }}>
                      Remarks: {v.remarks}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : myEditable.length > 0 ? (
        <div style={{ marginTop: 24 }}>
          <SectionLabel>Your Submissions (editable for 24h)</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {myEditable.map((v) => {
              const hoursLeft = Math.max(
                1,
                Math.ceil(
                  (DAY_MS - (Date.now() - (v.loggedAt ?? 0))) / (60 * 60 * 1000),
                ),
              );
              return (
                <div
                  key={v.id}
                  style={{
                    background: "#fff",
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: 14,
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
                    <div style={{ fontWeight: 700, fontSize: 13, color: C.ink }}>
                      {fmtDate(v.date)}
                    </div>
                    <div
                      onClick={() => onOpenEditVisit(outlet.id, v)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onOpenEditVisit(outlet.id, v);
                        }
                      }}
                      className="dz-tap"
                      style={{
                        fontSize: 12,
                        color: C.green,
                        fontWeight: 700,
                        cursor: "pointer",
                        border: `1px solid ${C.green}`,
                        borderRadius: 8,
                        padding: "5px 12px",
                      }}
                    >
                      Edit
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: C.ink, marginTop: 5 }}>
                    Stock {v.stock} · Sold {v.sold} · Rank #{v.rank}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                    Editable for {hoursLeft} more hours
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          style={{
            fontSize: 11,
            color: C.muted,
            marginTop: 10,
            textAlign: "center",
          }}
        >
          Visit history is available to the central data team only.
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ fontSize: 13, color: C.ink }}>
      <span style={{ color: C.sub }}>{label}:</span> {value}
    </div>
  );
}
