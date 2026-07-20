export type TFunc = (
  key: string,
  params?: Record<string, string | number>,
) => string;

const KNOWN_TYPES = new Set([
  "Kirana",
  "Tea Stall",
  "Wholesale",
  "Paan",
  "Other",
]);

/**
 * Translate a standard outlet type; pass through custom "Other" text unchanged
 * (it's user-entered and can't be translated).
 */
export function tType(t: TFunc, typeLabel: string): string {
  return KNOWN_TYPES.has(typeLabel) ? t(`type.${typeLabel}`) : typeLabel;
}

/** "None" / "Local Brands — Vimal" style summary, translated. */
export function tCompetitor(t: TFunc, level: string, brand: string): string {
  if (level === "None" || !level) return t("competitor.None");
  const base = t(`competitor.${level}`);
  return brand ? `${base} — ${brand}` : base;
}
