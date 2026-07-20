"use client";

import { C } from "../constants";
import { useTracker } from "../store";
import {
  Button,
  CompetitorPicker,
  Field,
  FieldGrid,
  StepDots,
  TextArea,
  TextInput,
} from "../ui";
import { tCompetitor, useT } from "@/features/i18n";

export function AddVisit() {
  const { state, setAv, onAvNext, onAvBack, submitVisit } = useTracker();
  const { t } = useT();

  const STEP_LABELS = [t("av.step.visitData"), t("av.step.review")];

  const f = state.avForm;
  const needsBrand =
    f.competitor === "Local Brands" || f.competitor === "National Brands";

  const step1Disabled = !(
    f.stock !== "" &&
    f.sold !== "" &&
    f.rank !== "" &&
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
            {f.town}, {f.division}
          </Sub>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FieldGrid>
              <Field label={`${t("field.stock")} *`}>
                <TextInput
                  type="number"
                  inputMode="numeric"
                  value={f.stock}
                  onChange={(e) => setAv({ stock: e.target.value })}
                  placeholder={t("placeholder.packets")}
                />
              </Field>
              <Field label={`${t("field.sold")} *`}>
                <TextInput
                  type="number"
                  inputMode="numeric"
                  value={f.sold}
                  onChange={(e) => setAv({ sold: e.target.value })}
                  placeholder={t("placeholder.packets")}
                />
              </Field>
            </FieldGrid>
            <Field label={`${t("field.rank")} *`}>
              <TextInput
                type="number"
                inputMode="numeric"
                value={f.rank}
                onChange={(e) => setAv({ rank: e.target.value })}
                placeholder={t("placeholder.rankEg")}
              />
            </Field>
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
              {f.town}, {f.division}
            </div>
            <div
              style={{
                borderTop: `1px solid ${C.border}`,
                marginTop: 4,
                paddingTop: 8,
              }}
            >
              <span style={{ color: C.sub }}>{t("review.stock")}:</span>{" "}
              {f.stock} {t("review.pkts")} ·{" "}
              <span style={{ color: C.sub }}>{t("review.sold")}:</span> {f.sold}{" "}
              {t("review.pkts")} ·{" "}
              <span style={{ color: C.sub }}>{t("review.rank")}:</span> #{f.rank}
            </div>
            <div>
              <span style={{ color: C.sub }}>{t("review.competitor")}:</span>{" "}
              {tCompetitor(t, f.competitor, f.competitorBrand)}
            </div>
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
