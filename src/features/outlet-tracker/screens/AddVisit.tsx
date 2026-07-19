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
import { competitorSummary } from "../utils";

const STEP_LABELS = ["Visit Data", "Review"];

export function AddVisit() {
  const { state, setAv, onAvNext, onAvBack, submitVisit } = useTracker();

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
              <Field label="Stock at Outlet *">
                <TextInput
                  type="number"
                  inputMode="numeric"
                  value={f.stock}
                  onChange={(e) => setAv({ stock: e.target.value })}
                  placeholder="Packets"
                />
              </Field>
              <Field label="Packets Sold *">
                <TextInput
                  type="number"
                  inputMode="numeric"
                  value={f.sold}
                  onChange={(e) => setAv({ sold: e.target.value })}
                  placeholder="Packets"
                />
              </Field>
            </FieldGrid>
            <Field label="Deedar Rank at Outlet *">
              <TextInput
                type="number"
                inputMode="numeric"
                value={f.rank}
                onChange={(e) => setAv({ rank: e.target.value })}
                placeholder="e.g. 1 = first"
              />
            </Field>
            <div>
              <Field label="Competitor Presence *">
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
                    placeholder="Name the competitor brand"
                  />
                </div>
              ) : null}
            </div>
            <Field label="Remarks (optional)">
              <TextArea
                value={f.remarks}
                onChange={(e) => setAv({ remarks: e.target.value })}
              />
            </Field>
          </div>
          <NavRow>
            <Button variant="ghost" onClick={onAvBack} style={{ flex: 1 }}>
              Back
            </Button>
            <Button
              onClick={onAvNext}
              disabled={step1Disabled}
              style={{ flex: 2 }}
            >
              Review
            </Button>
          </NavRow>
        </>
      ) : null}

      {state.avStep === 2 ? (
        <>
          <Heading>Review &amp; Submit Visit</Heading>
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
              <span style={{ color: C.sub }}>Outlet:</span> {f.name}
            </div>
            <div>
              <span style={{ color: C.sub }}>Location:</span> {f.town},{" "}
              {f.division}
            </div>
            <div
              style={{
                borderTop: `1px solid ${C.border}`,
                marginTop: 4,
                paddingTop: 8,
              }}
            >
              <span style={{ color: C.sub }}>Stock:</span> {f.stock} pkts ·{" "}
              <span style={{ color: C.sub }}>Sold:</span> {f.sold} pkts ·{" "}
              <span style={{ color: C.sub }}>Rank:</span> #{f.rank}
            </div>
            <div>
              <span style={{ color: C.sub }}>Competitor:</span>{" "}
              {competitorSummary(f.competitor, f.competitorBrand)}
            </div>
          </div>
          <NavRow>
            <Button variant="ghost" onClick={onAvBack} style={{ flex: 1 }}>
              Back
            </Button>
            <Button variant="gold" onClick={submitVisit} style={{ flex: 2 }}>
              Submit Visit
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
