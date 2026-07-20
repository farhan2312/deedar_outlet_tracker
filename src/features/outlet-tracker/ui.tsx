"use client";

import type {
  ChangeEvent,
  CSSProperties,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import { C, COMPETITOR_LEVELS } from "./constants";
import type { CompetitorLevel } from "./types";
import { useT } from "@/features/i18n";

type ChangeHandler = (
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
) => void;

const baseField: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  fontSize: 14,
  outline: "none",
  background: C.card,
  color: C.ink,
};

export function Label({ children }: { children: ReactNode }) {
  return (
    <label
      style={{ fontSize: 12, fontWeight: 600, color: C.ink, display: "block" }}
    >
      {children}
    </label>
  );
}

export function Field({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

interface TextInputProps {
  value: string;
  onChange: ChangeHandler;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "tel";
  list?: string;
  ariaLabel?: string;
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  list,
  ariaLabel,
}: TextInputProps) {
  return (
    <input
      className="dz-input dz-tap"
      type={type}
      inputMode={inputMode}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      list={list}
      aria-label={ariaLabel}
      style={baseField}
    />
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  value: string;
  onChange: ChangeHandler;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      className="dz-input dz-tap"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      style={{ ...baseField, resize: "none", fontFamily: "inherit" }}
    />
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export function Select({ children, style, ...rest }: SelectProps) {
  return (
    <select
      className="dz-input dz-tap"
      style={{ ...baseField, appearance: "auto", ...style }}
      {...rest}
    >
      {children}
    </select>
  );
}

type ButtonVariant = "green" | "gold" | "ghost";

export function Button({
  children,
  onClick,
  variant = "green",
  disabled,
  style,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: CSSProperties;
  type?: "button" | "submit";
}) {
  const variants: Record<ButtonVariant, CSSProperties> = {
    green: { background: C.green, color: "#fff", border: "none" },
    gold: { background: C.gold, color: "#fff", border: "none" },
    ghost: {
      background: C.card,
      color: C.ink,
      border: `1px solid ${C.border}`,
    },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`dz-tap dz-btn-${variant}`}
      style={{
        width: "100%",
        padding: "14px",
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  onClick,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
}) {
  return (
    <div
      onClick={onClick}
      className={onClick ? "dz-tap dz-card-tap" : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 14,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "gold",
}: {
  children: ReactNode;
  tone?: "gold" | "green";
}) {
  const tones = {
    gold: { color: C.gold, background: C.goldBg },
    green: { color: C.green, background: C.greenBg },
  } as const;
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: 6,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        ...tones[tone],
      }}
    >
      {children}
    </span>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: C.sub,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

export function StepDots({
  labels,
  current,
}: {
  labels: string[];
  current: number;
}) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
      {labels.map((label, i) => {
        const active = i + 1 <= current;
        return (
          <div key={label} style={{ flex: 1 }}>
            <div
              style={{
                height: 4,
                borderRadius: 2,
                background: active ? C.green : C.border,
              }}
            />
            <div
              style={{
                fontSize: 10,
                color: active ? C.green : C.muted,
                marginTop: 5,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CompetitorPicker({
  value,
  onSelect,
}: {
  value: CompetitorLevel | "";
  onSelect: (level: CompetitorLevel) => void;
}) {
  const { t } = useT();
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
      {COMPETITOR_LEVELS.map((c) => {
        const selected = value === c;
        return (
          <div
            key={c}
            onClick={() => onSelect(c)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(c);
              }
            }}
            className="dz-tap"
            style={{
              flex: 1,
              textAlign: "center",
              padding: "10px 4px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              border: `1px solid ${selected ? C.green : C.border}`,
              background: selected ? C.green : C.card,
              color: selected ? "#fff" : C.ink,
            }}
          >
            {t(`competitor.${c}`)}
          </div>
        );
      })}
    </div>
  );
}

/** Two-column grid on wider screens, single column on mobile. */
export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="dz-field-grid">{children}</div>;
}
