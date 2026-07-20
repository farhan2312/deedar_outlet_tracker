"use client";

import { useMemo } from "react";
import { C, TYPES } from "../constants";
import { useTracker } from "../store";
import {
  Button,
  Field,
  FieldGrid,
  Select,
  StepDots,
  TextArea,
  TextInput,
} from "../ui";
import { decorateOutlet } from "../utils";
import { tType, useT } from "@/features/i18n";

export function AddOutlet() {
  const {
    state,
    setAdd,
    onAddMobileChange,
    onAddStep1Next,
    onAddStep2Next,
    onAddBack,
    onViewDuplicate,
    submitAddOutlet,
  } = useTracker();
  const { t } = useT();

  const STEP_LABELS = [
    t("ao.step.checkDup"),
    t("ao.step.details"),
    t("ao.step.review"),
  ];

  const f = state.addForm;
  const isOther = f.type === "Other";

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
          <Heading>{t("ao.checkTitle")}</Heading>
          <Sub>{t("ao.checkSub")}</Sub>
          <Field label={t("field.mobile")}>
            <TextInput
              type="tel"
              inputMode="numeric"
              value={f.mobile}
              onChange={onAddMobileChange}
              placeholder={t("field.mobilePlaceholder")}
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
                {t("ao.dupFound")}
              </div>
              <div style={{ fontSize: 12, color: C.ink, marginTop: 4 }}>
                {t("ao.dupText", {
                  name: duplicate.name,
                  town: duplicate.town,
                })}
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
                {t("ao.viewExisting")}
              </div>
            </div>
          ) : (
            <div style={{ height: 14 }} />
          )}

          <Button onClick={onAddStep1Next} disabled={step1Disabled}>
            {t("common.continue")}
          </Button>
        </>
      ) : null}

      {state.addStep === 2 ? (
        <>
          <Heading>{t("ao.identityTitle")}</Heading>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label={`${t("field.outletName")} *`}>
              <TextInput
                value={f.name}
                onChange={(e) => setAdd({ name: e.target.value })}
              />
            </Field>
            <Field label={`${t("field.poc")} *`}>
              <TextInput
                value={f.poc}
                onChange={(e) => setAdd({ poc: e.target.value })}
              />
            </Field>
            <Field label={`${t("field.address")} *`}>
              <TextArea
                value={f.address}
                onChange={(e) => setAdd({ address: e.target.value })}
              />
            </Field>
            <FieldGrid>
              <Field label={`${t("field.town")} *`}>
                <TextInput
                  value={f.town}
                  list="townList"
                  onChange={(e) => setAdd({ town: e.target.value })}
                />
              </Field>
              <Field label={`${t("field.division")} *`}>
                <TextInput
                  value={f.division}
                  onChange={(e) => setAdd({ division: e.target.value })}
                />
              </Field>
            </FieldGrid>
            <Field label={`${t("field.type")} *`}>
              <Select
                value={f.type}
                onChange={(e) => setAdd({ type: e.target.value })}
              >
                <option value="">{t("common.select")}</option>
                {TYPES.map((ty) => (
                  <option key={ty} value={ty}>
                    {t(`type.${ty}`)}
                  </option>
                ))}
              </Select>
            </Field>
            {isOther ? (
              <TextInput
                value={f.typeOther}
                onChange={(e) => setAdd({ typeOther: e.target.value })}
                placeholder={t("field.specifyType")}
              />
            ) : null}

            <GpsBox />
          </div>

          <NavRow>
            <Button variant="ghost" onClick={onAddBack} style={{ flex: 1 }}>
              {t("common.back")}
            </Button>
            <Button
              onClick={onAddStep2Next}
              disabled={step2Disabled}
              style={{ flex: 2 }}
            >
              {t("common.review")}
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
          <Heading>{t("ao.reviewTitle")}</Heading>
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
            <Row label={t("review.outlet")} value={f.name} />
            <Row label={t("review.poc")} value={`${f.poc} · ${f.mobile}`} />
            <Row label={t("review.address")} value={f.address} />
            <Row
              label={t("review.location")}
              value={`${f.town}, ${f.division}`}
            />
            <Row
              label={t("review.type")}
              value={
                isOther ? f.typeOther || t("type.Other") : tType(t, f.type)
              }
            />
            <Row label={t("review.gps")} value={`${f.lat}, ${f.lng}`} />
          </div>
          <NavRow>
            <Button variant="ghost" onClick={onAddBack} style={{ flex: 1 }}>
              {t("common.back")}
            </Button>
            <Button variant="gold" onClick={submitAddOutlet} style={{ flex: 2 }}>
              {t("ao.submitOutlet")}
            </Button>
          </NavRow>
        </>
      ) : null}
    </div>
  );
}

function GpsBox() {
  const { state, setAdd, onCaptureGps } = useTracker();
  const { t } = useT();
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
        {t("gps.title")} *
      </div>
      {s === "idle" ? (
        <Button onClick={onCaptureGps} style={{ padding: 11, fontSize: 13 }}>
          {t("gps.capture")}
        </Button>
      ) : null}
      {s === "capturing" ? (
        <div style={{ fontSize: 13, color: C.sub }}>{t("gps.locating")}</div>
      ) : null}
      {s === "success" ? (
        <div style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>
          {t("gps.captured", { lat: f.lat, lng: f.lng })}
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
              placeholder={t("gps.latitude")}
            />
            <TextInput
              value={f.lng}
              onChange={(e) => setAdd({ lng: e.target.value })}
              placeholder={t("gps.longitude")}
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
            {t("gps.retry")}
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
