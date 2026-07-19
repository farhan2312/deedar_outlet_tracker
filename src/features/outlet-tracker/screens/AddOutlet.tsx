"use client";

import { useMemo } from "react";
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
import { competitorSummary, decorateOutlet } from "../utils";

const STEP_LABELS = ["Check Duplicate", "Outlet Details", "Visit Data", "Review"];

export function AddOutlet() {
  const {
    state,
    setAdd,
    onAddMobileChange,
    onAddStep1Next,
    onAddStep2Next,
    onAddStep3Next,
    onAddBack,
    onViewDuplicate,
    submitAddOutlet,
  } = useTracker();

  const f = state.addForm;
  const isOther = f.type === "Other";
  const needsBrand =
    f.competitor === "Local Brands" || f.competitor === "National Brands";

  const step1Disabled = f.mobile.length !== 10;
  const step2Disabled = !(
    f.name &&
    f.poc &&
    f.address &&
    f.town &&
    f.division &&
    f.type &&
    (!isOther || f.typeOther) &&
    f.lat &&
    f.lng
  );
  const step3Disabled = !(
    f.stock !== "" &&
    f.sold !== "" &&
    f.rank !== "" &&
    f.competitor &&
    (!needsBrand || f.competitorBrand)
  );

  const duplicate = useMemo(() => {
    const o = state.addDuplicateOutletId
      ? state.outlets.find((x) => x.id === state.addDuplicateOutletId)
      : null;
    return o ? decorateOutlet(o) : null;
  }, [state.addDuplicateOutletId, state.outlets]);

  const townOptions = useMemo(
    () => [...new Set(state.outlets.map((o) => o.town))],
    [state.outlets],
  );

  return (
    <div style={{ padding: 20 }}>
      <StepDots labels={STEP_LABELS} current={state.addStep} />

      {state.addStep === 1 ? (
        <>
          <Heading>Check for Existing Outlet</Heading>
          <Sub>
            Enter the outlet&apos;s mobile number to rule out a duplicate before
            creating a new record.
          </Sub>
          <Field label="Mobile Number">
            <TextInput
              type="tel"
              inputMode="numeric"
              value={f.mobile}
              onChange={onAddMobileChange}
              placeholder="10-digit mobile number"
            />
          </Field>

          {duplicate ? (
            <div
              style={{
                background: C.dangerBg,
                border: `1px solid ${C.dangerBorder}`,
                borderRadius: 10,
                padding: 14,
                margin: "14px 0",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: C.danger }}>
                Possible duplicate found
              </div>
              <div style={{ fontSize: 12, color: C.ink, marginTop: 4 }}>
                {duplicate.name} · {duplicate.town} is already registered with
                this mobile number.
              </div>
              <div
                onClick={onViewDuplicate}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onViewDuplicate();
                  }
                }}
                style={{
                  fontSize: 12,
                  color: C.danger,
                  fontWeight: 700,
                  marginTop: 8,
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                View existing outlet
              </div>
            </div>
          ) : (
            <div style={{ height: 14 }} />
          )}

          <Button onClick={onAddStep1Next} disabled={step1Disabled}>
            Continue
          </Button>
        </>
      ) : null}

      {state.addStep === 2 ? (
        <>
          <Heading>Outlet Identity</Heading>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Name of the Outlet *">
              <TextInput
                value={f.name}
                onChange={(e) => setAdd({ name: e.target.value })}
              />
            </Field>
            <Field label="Point of Contact *">
              <TextInput
                value={f.poc}
                onChange={(e) => setAdd({ poc: e.target.value })}
              />
            </Field>
            <Field label="Address *">
              <TextArea
                value={f.address}
                onChange={(e) => setAdd({ address: e.target.value })}
              />
            </Field>
            <FieldGrid>
              <Field label="Town/City *">
                <TextInput
                  value={f.town}
                  list="townList"
                  onChange={(e) => setAdd({ town: e.target.value })}
                />
              </Field>
              <Field label="Division *">
                <TextInput
                  value={f.division}
                  onChange={(e) => setAdd({ division: e.target.value })}
                />
              </Field>
            </FieldGrid>
            <Field label="Type of Outlet *">
              <Select
                value={f.type}
                onChange={(e) => setAdd({ type: e.target.value })}
              >
                <option value="">Select</option>
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
                onChange={(e) => setAdd({ typeOther: e.target.value })}
                placeholder="Specify outlet type"
              />
            ) : null}

            <GpsBox />
          </div>

          <NavRow>
            <Button variant="ghost" onClick={onAddBack} style={{ flex: 1 }}>
              Back
            </Button>
            <Button
              onClick={onAddStep2Next}
              disabled={step2Disabled}
              style={{ flex: 2 }}
            >
              Continue
            </Button>
          </NavRow>

          <datalist id="townList">
            {townOptions.map((tw) => (
              <option key={tw} value={tw} />
            ))}
          </datalist>
        </>
      ) : null}

      {state.addStep === 3 ? (
        <>
          <Heading>First Visit Data</Heading>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FieldGrid>
              <Field label="Stock at Outlet *">
                <TextInput
                  type="number"
                  inputMode="numeric"
                  value={f.stock}
                  onChange={(e) => setAdd({ stock: e.target.value })}
                  placeholder="Packets"
                />
              </Field>
              <Field label="Packets Sold *">
                <TextInput
                  type="number"
                  inputMode="numeric"
                  value={f.sold}
                  onChange={(e) => setAdd({ sold: e.target.value })}
                  placeholder="Packets"
                />
              </Field>
            </FieldGrid>
            <Field label="Deedar Rank at Outlet (shelf position) *">
              <TextInput
                type="number"
                inputMode="numeric"
                value={f.rank}
                onChange={(e) => setAdd({ rank: e.target.value })}
                placeholder="e.g. 1 = first"
              />
            </Field>
            <div>
              <Field label="Competitor Presence *">
                <CompetitorPicker
                  value={f.competitor}
                  onSelect={(c) => setAdd({ competitor: c })}
                />
              </Field>
              {needsBrand ? (
                <div style={{ marginTop: 8 }}>
                  <TextInput
                    value={f.competitorBrand}
                    onChange={(e) => setAdd({ competitorBrand: e.target.value })}
                    placeholder="Name the competitor brand"
                  />
                </div>
              ) : null}
            </div>
            <Field label="Remarks (optional)">
              <TextArea
                value={f.remarks}
                onChange={(e) => setAdd({ remarks: e.target.value })}
              />
            </Field>
          </div>
          <NavRow>
            <Button variant="ghost" onClick={onAddBack} style={{ flex: 1 }}>
              Back
            </Button>
            <Button
              onClick={onAddStep3Next}
              disabled={step3Disabled}
              style={{ flex: 2 }}
            >
              Review
            </Button>
          </NavRow>
        </>
      ) : null}

      {state.addStep === 4 ? (
        <>
          <Heading>Review &amp; Submit</Heading>
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
            <Row label="Outlet" value={f.name} />
            <Row label="POC" value={`${f.poc} · ${f.mobile}`} />
            <Row label="Address" value={f.address} />
            <Row label="Location" value={`${f.town}, ${f.division}`} />
            <Row
              label="Type"
              value={isOther ? f.typeOther || "Other" : f.type}
            />
            <Row label="GPS" value={`${f.lat}, ${f.lng}`} />
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
            <Row
              label="Competitor"
              value={competitorSummary(f.competitor, f.competitorBrand)}
            />
          </div>
          <NavRow>
            <Button variant="ghost" onClick={onAddBack} style={{ flex: 1 }}>
              Back
            </Button>
            <Button variant="gold" onClick={submitAddOutlet} style={{ flex: 2 }}>
              Submit Outlet
            </Button>
          </NavRow>
        </>
      ) : null}
    </div>
  );
}

function GpsBox() {
  const { state, setAdd, onCaptureGps } = useTracker();
  const f = state.addForm;
  const s = state.addGpsStatus;
  return (
    <div
      style={{
        background: C.greenBg,
        borderRadius: 10,
        padding: 14,
        marginTop: 4,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: C.ink,
          marginBottom: 8,
        }}
      >
        GPS Coordinates *
      </div>
      {s === "idle" ? (
        <Button onClick={onCaptureGps} style={{ padding: 11, fontSize: 13 }}>
          Capture Current Location
        </Button>
      ) : null}
      {s === "capturing" ? (
        <div style={{ fontSize: 13, color: C.sub }}>Locating…</div>
      ) : null}
      {s === "success" ? (
        <div style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>
          Captured: {f.lat}, {f.lng}
        </div>
      ) : null}
      {s === "error" ? (
        <>
          <div style={{ fontSize: 12, color: C.danger, marginBottom: 8 }}>
            {state.addGpsErrorMsg}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <TextInput
              value={f.lat}
              onChange={(e) => setAdd({ lat: e.target.value })}
              placeholder="Latitude"
            />
            <TextInput
              value={f.lng}
              onChange={(e) => setAdd({ lng: e.target.value })}
              placeholder="Longitude"
            />
          </div>
          <div
            onClick={onCaptureGps}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onCaptureGps();
              }
            }}
            style={{
              fontSize: 12,
              color: C.green,
              fontWeight: 700,
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            Retry location capture
          </div>
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

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 13, color: C.sub, margin: "-10px 0 16px" }}>
      {children}
    </div>
  );
}

function NavRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 20 }}>{children}</div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span style={{ color: C.sub }}>{label}:</span> {value}
    </div>
  );
}
