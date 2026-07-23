"use client";

import { useMemo } from "react";
import { AREAS_BY_HEAD_QUARTER, C, DAY_MS, HEAD_QUARTERS, TYPES } from "../constants";
import { useTracker } from "../store";
import {
  Badge,
  Button,
  Field,
  FieldGrid,
  SectionLabel,
  Select,
  TextArea,
  TextInput,
} from "../ui";
import { decorateOutlet, fmtDate } from "../utils";
import type { Visit } from "../types";
import { tCompetitor, tType, useT } from "@/features/i18n";

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
  const { t } = useT();

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
              <Badge>{tType(t, outlet.typeLabel)}</Badge>
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
              {t("common.edit")}
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
            <Detail label={t("od.mobileLabel")} value={outlet.mobile} />
            {outlet.address ? (
              <Detail label={t("od.addressLabel")} value={outlet.address} />
            ) : null}
            <Detail
              label={t("od.townDivisionLabel")}
              value={`${outlet.area}, ${outlet.headQuarter}`}
            />
            <Detail label={t("od.gpsLabel")} value={outlet.gpsLabel} />
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
            <Field label={t("field.outletName")}>
              <TextInput
                value={ef.name ?? ""}
                onChange={(e) => setEditIdentity({ name: e.target.value })}
              />
            </Field>
            <Field label={t("field.mobile")}>
              <TextInput
                value={ef.mobile ?? ""}
                inputMode="numeric"
                onChange={(e) => setEditIdentity({ mobile: e.target.value })}
              />
            </Field>
            <Field label={t("field.address")}>
              <TextArea
                value={ef.address ?? ""}
                onChange={(e) => setEditIdentity({ address: e.target.value })}
              />
            </Field>
            <FieldGrid>
              <Field label={t("field.headQuarter")}>
                <Select
                  value={ef.headQuarter ?? ""}
                  onChange={(e) => {
                    const hq = e.target.value;
                    const options = AREAS_BY_HEAD_QUARTER[hq] ?? [];
                    setEditIdentity({
                      headQuarter: hq,
                      area: options.includes(ef.area ?? "") ? ef.area : "",
                    });
                  }}
                >
                  <option value="">{t("common.select")}</option>
                  {HEAD_QUARTERS.map((hq) => (
                    <option key={hq} value={hq}>
                      {hq}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t("field.area")}>
                <Select
                  value={ef.area ?? ""}
                  onChange={(e) => setEditIdentity({ area: e.target.value })}
                  disabled={!ef.headQuarter}
                >
                  <option value="">{t("common.select")}</option>
                  {(ef.headQuarter
                    ? AREAS_BY_HEAD_QUARTER[ef.headQuarter] ?? []
                    : []
                  ).map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </Select>
              </Field>
            </FieldGrid>
            <Field label={t("field.type")}>
              <Select
                value={ef.type ?? ""}
                onChange={(e) => setEditIdentity({ type: e.target.value })}
              >
                {TYPES.map((ty) => (
                  <option key={ty} value={ty}>
                    {t(`type.${ty}`)}
                  </option>
                ))}
              </Select>
            </Field>
            {editIsOther ? (
              <TextInput
                value={ef.typeOther ?? ""}
                onChange={(e) => setEditIdentity({ typeOther: e.target.value })}
                placeholder={t("field.specifyType")}
              />
            ) : null}
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <Button variant="ghost" onClick={onCancelEditIdentity}>
                {t("common.cancel")}
              </Button>
              <Button onClick={saveEditIdentity}>{t("common.saveChanges")}</Button>
            </div>
          </div>
        )}
      </div>

      {user.role !== "SO" ? (
        <Button variant="gold" onClick={onAddVisitForSelected}>
          {t("od.addVisit")}
        </Button>
      ) : null}

      {isAdmin ? (
        <div style={{ marginTop: 24 }}>
          <SectionLabel>
            {t("od.visitHistory", { count: visitHistory.length })}
          </SectionLabel>
          {visitHistory.length === 0 ? (
            <div style={{ fontSize: 13, color: C.muted }}>
              {t("od.noVisits")}
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
                      {t("od.repShort", { rep: v.rep || "—" })}
                    </div>
                  </div>
                  <VisitBreakdown v={v} />
                  <div style={{ fontSize: 11, color: C.sub, marginTop: 3 }}>
                    {t("od.competitorLine", {
                      value: tCompetitor(t, v.competitor, v.competitorBrand),
                    })}
                  </div>
                  {v.remarks ? (
                    <div style={{ fontSize: 11, color: C.sub, marginTop: 3 }}>
                      {t("od.remarksLine", { value: v.remarks })}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : myEditable.length > 0 ? (
        <div style={{ marginTop: 24 }}>
          <SectionLabel>{t("od.yourSubmissions")}</SectionLabel>
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
                      {t("common.edit")}
                    </div>
                  </div>
                  <VisitBreakdown v={v} />
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                    {t("dash.editableHours", { hours: hoursLeft })}
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
          {t("od.centralOnly")}
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

/** Per-segment stock/sold/rank breakdown for a visit (falls back to totals for
 *  legacy pre-segment visits, whose single line has an empty segment). */
function VisitBreakdown({ v }: { v: Visit }) {
  const { t } = useT();
  if (v.items && v.items.length > 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          marginTop: 5,
        }}
      >
        {v.items.map((it, i) => (
          <div key={i} style={{ fontSize: 12, color: C.ink }}>
            <span style={{ fontWeight: 700 }}>{it.segment || "—"}</span>{" "}
            <span style={{ color: C.sub }}>
              {t("od.stockSoldRank", {
                stock: it.stock,
                sold: it.sold,
                rank: it.rank,
              })}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ fontSize: 12, color: C.ink, marginTop: 5 }}>
      {t("od.stockSoldRank", { stock: v.stock, sold: v.sold, rank: v.rank })}
    </div>
  );
}
