"use client";

import { C, TYPES } from "../constants";
import { useTracker } from "../store";
import {
  Button,
  CompetitorPicker,
  Field,
  FieldGrid,
  Select,
  StepDots,
  TextArea,
  TextInput,
} from "../ui";
import { competitorSummary } from "../utils";

const STEP_LABELS = ["Confirm Details", "Visit Data", "Review"];

export function RecordVisit() {
  const {
    state,
    setRv,
    onRvStep1Next,
    onRvStep2Next,
    onRvBack,
    submitVisit,
  } = useTracker();

  const f = state.rvForm;
  const isOther = f.type === "Other";
  const needsBrand =
    f.competitor === "Local Brands" || f.competitor === "National Brands";

  const step1Disabled = !(
    f.name &&
    f.poc &&
    f.address &&
    f.town &&
    f.division &&
    f.type &&
    (!isOther || f.typeOther)
  );
  const step2Disabled = !(
    f.stock !== "" &&
    f.sold !== "" &&
    f.rank !== "" &&
    f.competitor &&
    (!needsBrand || f.competitorBrand)
  );

  return (
    <div style={{ padding: 20 }}>
      <StepDots labels={STEP_LABELS} current={state.rvStep} />

      {state.rvStep === 1 ? (
        <>
          <Heading>Confirm Outlet Details</Heading>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Name of the Outlet">
              <TextInput
                value={f.name}
                onChange={(e) => setRv({ name: e.target.value })}
              />
            </Field>
            <Field label="Point of Contact">
              <TextInput
                value={f.poc}
                onChange={(e) => setRv({ poc: e.target.value })}
              />
            </Field>
            <Field label="Mobile Number">
              <TextInput
                value={f.mobile}
                inputMode="numeric"
                onChange={(e) => setRv({ mobile: e.target.value })}
              />
            </Field>
            <Field label="Address">
              <TextArea
                value={f.address}
                onChange={(e) => setRv({ address: e.target.value })}
              />
            </Field>
            <FieldGrid>
              <Field label="Town/City">
                <TextInput
                  value={f.town}
                  onChange={(e) => setRv({ town: e.target.value })}
                />
              </Field>
              <Field label="Division">
                <TextInput
                  value={f.division}
                  onChange={(e) => setRv({ division: e.target.value })}
                />
              </Field>
            </FieldGrid>
            <Field label="Type of Outlet">
              <Select
                value={f.type}
                onChange={(e) => setRv({ type: e.target.value })}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            {isOther ? (
              <TextInput
                value={f.typeOther}
                onChange={(e) => setRv({ typeOther: e.target.value })}
                placeholder="Specify outlet type"
              />
            ) : null}
          </div>
          <NavRow>
            <Button variant="ghost" onClick={onRvBack} style={{ flex: 1 }}>
              Back
            </Button>
            <Button
              onClick={onRvStep1Next}
              disabled={step1Disabled}
              style={{ flex: 2 }}
            >
              Continue
            </Button>
          </NavRow>
        </>
      ) : null}

      {state.rvStep === 2 ? (
        <>
          <Heading>This Visit&apos;s Data</Heading>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FieldGrid>
              <Field label="Stock at Outlet *">
                <TextInput
                  type="number"
                  inputMode="numeric"
                  value={f.stock}
                  onChange={(e) => setRv({ stock: e.target.value })}
                  placeholder="Packets"
                />
              </Field>
              <Field label="Packets Sold *">
                <TextInput
                  type="number"
                  inputMode="numeric"
                  value={f.sold}
                  onChange={(e) => setRv({ sold: e.target.value })}
                  placeholder="Packets"
                />
              </Field>
            </FieldGrid>
            <Field label="Deedar Rank at Outlet *">
              <TextInput
                type="number"
                inputMode="numeric"
                value={f.rank}
                onChange={(e) => setRv({ rank: e.target.value })}
                placeholder="e.g. 1 = first"
              />
            </Field>
            <div>
              <Field label="Competitor Presence *">
                <CompetitorPicker
                  value={f.competitor}
                  onSelect={(c) => setRv({ competitor: c })}
                />
              </Field>
              {needsBrand ? (
                <div style={{ marginTop: 8 }}>
                  <TextInput
                    value={f.competitorBrand}
                    onChange={(e) => setRv({ competitorBrand: e.target.value })}
                    placeholder="Name the competitor brand"
                  />
                </div>
              ) : null}
            </div>
            <Field label="Remarks (optional)">
              <TextArea
                value={f.remarks}
                onChange={(e) => setRv({ remarks: e.target.value })}
              />
            </Field>
          </div>
          <NavRow>
            <Button variant="ghost" onClick={onRvBack} style={{ flex: 1 }}>
              Back
            </Button>
            <Button
              onClick={onRvStep2Next}
              disabled={step2Disabled}
              style={{ flex: 2 }}
            >
              Review
            </Button>
          </NavRow>
        </>
      ) : null}

      {state.rvStep === 3 ? (
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
            <Button variant="ghost" onClick={onRvBack} style={{ flex: 1 }}>
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
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}

function NavRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 20 }}>{children}</div>
  );
}
