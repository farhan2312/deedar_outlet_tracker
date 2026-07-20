"use client";

import { useMemo } from "react";
import { C, DAY_MS } from "../constants";
import { useTracker } from "../store";
import {
  Button,
  CompetitorPicker,
  Field,
  FieldGrid,
  TextArea,
  TextInput,
} from "../ui";
import { useT } from "@/features/i18n";

export function EditVisit() {
  const { state, setEditVisit, saveEditVisit, onBack } = useTracker();
  const { t } = useT();
  const f = state.editVisitForm;
  const needsBrand =
    f.competitor === "Local Brands" || f.competitor === "National Brands";

  const { outletName, hoursLeft } = useMemo(() => {
    const outlet = state.editVisitOutletId
      ? state.outlets.find((o) => o.id === state.editVisitOutletId)
      : null;
    const record = outlet
      ? outlet.visits.find((v) => v.id === state.editVisitId)
      : null;
    const hrs =
      record && record.loggedAt
        ? Math.max(
            1,
            Math.ceil((DAY_MS - (Date.now() - record.loggedAt)) / (60 * 60 * 1000)),
          )
        : 24;
    return { outletName: outlet ? outlet.name : "", hoursLeft: hrs };
  }, [state.editVisitOutletId, state.editVisitId, state.outlets]);

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
        {t("ev.title")}
      </div>
      <div style={{ fontSize: 13, color: C.sub, marginBottom: 16 }}>
        {t("ev.subtitle", { name: outletName, hours: hoursLeft })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <FieldGrid>
          <Field label={`${t("field.stock")} *`}>
            <TextInput
              type="number"
              inputMode="numeric"
              value={f.stock ?? ""}
              onChange={(e) => setEditVisit({ stock: e.target.value })}
            />
          </Field>
          <Field label={`${t("field.sold")} *`}>
            <TextInput
              type="number"
              inputMode="numeric"
              value={f.sold ?? ""}
              onChange={(e) => setEditVisit({ sold: e.target.value })}
            />
          </Field>
        </FieldGrid>
        <Field label={`${t("field.rank")} *`}>
          <TextInput
            type="number"
            inputMode="numeric"
            value={f.rank ?? ""}
            onChange={(e) => setEditVisit({ rank: e.target.value })}
          />
        </Field>
        <div>
          <Field label={`${t("field.competitor")} *`}>
            <CompetitorPicker
              value={f.competitor ?? ""}
              onSelect={(c) => setEditVisit({ competitor: c })}
            />
          </Field>
          {needsBrand ? (
            <div style={{ marginTop: 8 }}>
              <TextInput
                value={f.competitorBrand ?? ""}
                onChange={(e) => setEditVisit({ competitorBrand: e.target.value })}
                placeholder={t("placeholder.competitorBrand")}
              />
            </div>
          ) : null}
        </div>
        <Field label={t("field.remarks")}>
          <TextArea
            value={f.remarks ?? ""}
            onChange={(e) => setEditVisit({ remarks: e.target.value })}
          />
        </Field>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <Button variant="ghost" onClick={onBack} style={{ flex: 1 }}>
          {t("common.cancel")}
        </Button>
        <Button variant="gold" onClick={saveEditVisit} style={{ flex: 2 }}>
          {t("ev.save")}
        </Button>
      </div>
    </div>
  );
}
