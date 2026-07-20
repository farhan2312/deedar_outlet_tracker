"use client";

import { C } from "@/features/outlet-tracker/constants";
import { LANGUAGES } from "./translations";
import { useT } from "./LanguageProvider";

/**
 * Compact EN / हिं switch. `tone` picks colours for a dark (green header) or
 * light (auth card / plain) background.
 */
export function LanguageToggle({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { lang, setLang } = useT();

  const isDark = tone === "dark";
  const border = isDark ? "rgba(255,255,255,0.35)" : C.border;
  const activeBg = isDark ? "#fff" : C.green;
  const activeFg = isDark ? C.green : "#fff";
  const idleFg = isDark ? "#fff" : C.sub;

  return (
    <div
      style={{
        display: "inline-flex",
        border: `1px solid ${border}`,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {LANGUAGES.map((l) => {
        const active = l.code === lang;
        return (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            aria-pressed={active}
            className="dz-tap"
            style={{
              padding: "4px 9px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              border: "none",
              background: active ? activeBg : "transparent",
              color: active ? activeFg : idleFg,
              lineHeight: 1.4,
            }}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
