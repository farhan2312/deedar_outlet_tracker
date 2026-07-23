"use client";

import { C, SEGMENT_NAMES } from "../constants";
import { useTracker } from "../store";
import {
  Button,
  CompetitorPicker,
  Field,
  SectionLabel,
  StepDots,
  TextArea,
  TextInput,
  VisitItemsEditor,
} from "../ui";
import { tCompetitor, useT } from "@/features/i18n";

export function AddVisit() {
  const { state, setAv, onAvNext, onAvBack, submitVisit } = useTracker();
  const { t } = useT();

  const STEP_LABELS = [t("av.step.visitData"), t("av.step.review")];

  const f = state.avForm;
  const needsBrand =
    f.competitor === "Local Brands" || f.competitor === "National Brands";

  const items = f.items ?? [];
  const itemsValid =
    items.length > 0 &&
    items.every(
      (it) => it.segment && it.stock !== "" && it.sold !== "" && it.rank !== "",
    );

  const step1Disabled = !(
    itemsValid &&
    f.competitor &&
    (!needsBrand || f.competitorBrand)
  );

  return (
    <div style={{ padding: 20 }}>
      <StepDots labels={STEP_LABELS} current={state.avStep} />

      {state.avStep === 1 ? (
        <>
          <Heading>{f.name}</Heading>
          <Sub>
            {f.area}, {f.headQuarter}
          </Sub>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <SectionLabel>{t("av.products")}</SectionLabel>
            <VisitItemsEditor
              items={items}
              onChange={(next) => setAv({ items: next })}
            />
            <div>
              <Field label={`${t("field.competitor")} *`}>
                <CompetitorPicker
                  value={f.competitor}
                  onSelect={(c) => setAv({ competitor: c })}
                />
              </Field>
              {needsBrand ? (
                <div style={{ marginTop: 8 }}>
                  <TextInput
                    value={f.competitorBrand}
                    onChange={(e) => setAv({ competitorBrand: e.target.value })}
                    placeholder={t("placeholder.competitorBrand")}
                  />
                </div>
              ) : null}
            </div>
            <Field label={t("field.remarks")}>
              <TextArea
                value={f.remarks}
                onChange={(e) => setAv({ remarks: e.target.value })}
              />
            </Field>
          </div>
          <NavRow>
            <Button variant="ghost" onClick={onAvBack} style={{ flex: 1 }}>
              {t("common.back")}
            </Button>
            <Button
              onClick={onAvNext}
              disabled={step1Disabled}
              style={{ flex: 2 }}
            >
              {t("common.review")}
            </Button>
          </NavRow>
        </>
      ) : null}

      {state.avStep === 2 ? (
        <>
          <Heading>{t("av.reviewTitle")}</Heading>
          <div
            style={{
              background: "#fff",
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontSize: 13,
              color: C.ink,
            }}
          >
            <div>
              <span style={{ color: C.sub }}>{t("review.outlet")}:</span>{" "}
              {f.name}
            </div>
            <div>
              <span style={{ color: C.sub }}>{t("review.location")}:</span>{" "}
              {f.area}, {f.headQuarter}
            </div>
            <div
              style={{
                borderTop: `1px solid ${C.border}`,
                marginTop: 4,
                paddingTop: 8,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <span style={{ color: C.sub, fontWeight: 600 }}>
                {t("review.products")}:
              </span>
              {items
                .filter((it) => it.segment)
                .map((it) => (
                  <div key={it.segment} style={{ paddingLeft: 2 }}>
                    <span style={{ fontWeight: 700 }}>{it.segment}</span>{" "}
                    <span style={{ color: C.muted }}>
                      {SEGMENT_NAMES[it.segment]}
                    </span>
                    <div style={{ color: C.sub, marginTop: 1 }}>
                      {t("review.stock")}: {it.stock} {t("review.pkts")} ·{" "}
                      {t("review.sold")}: {it.sold} {t("review.pkts")} ·{" "}
                      {t("review.rank")}: #{it.rank}
                    </div>
                  </div>
                ))}
            </div>
            <div>
              <span style={{ color: C.sub }}>{t("review.competitor")}:</span>{" "}
              {tCompetitor(t, f.competitor, f.competitorBrand)}
            </div>
            {f.remarks ? (
              <div>
                <span style={{ color: C.sub }}>{t("field.remarks")}:</span>{" "}
                {f.remarks}
              </div>
            ) : null}
          </div>
          <NavRow>
            <Button variant="ghost" onClick={onAvBack} style={{ flex: 1 }}>
              {t("common.back")}
            </Button>
            <Button variant="gold" onClick={submitVisit} style={{ flex: 2 }}>
              {t("av.submit")}
            </Button>
          </NavRow>
        </>
      ) : null}
    </div>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 17,
        color: C.ink,
        marginBottom: 4,
      }}
    >
      {children}
    </div>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 13, color: C.sub, marginBottom: 16 }}>
      {children}
    </div>
  );
}

function NavRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 20 }}>{children}</div>
  );
}
