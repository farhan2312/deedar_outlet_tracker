import type {
  CompetitorLevel,
  OutletForm,
  OutletType,
  ProductSegment,
  VisitItemForm,
} from "./types";

export const TYPES: OutletType[] = [
  "Kirana",
  "Tea Stall",
  "Wholesale",
  "Paan",
  "Other",
];

/** The four Deedar product segments, in display order. */
export const PRODUCT_SEGMENTS: ProductSegment[] = [
  "DG10",
  "DG20",
  "DB20",
  "DB40",
];

/** Full product-segment names, keyed by code. Brand names — not translated. */
export const SEGMENT_NAMES: Record<string, string> = {
  DG10: "Deedar Green 10",
  DG20: "Deedar Green 20",
  DB20: "Deedar Blue 20",
  DB40: "Deedar Blue 40",
};

export const COMPETITOR_LEVELS: CompetitorLevel[] = [
  "None",
  "Local Brands",
  "National Brands",
];

/**
 * The single C&F (Carrying & Forwarding) location the operation runs under.
 * Head Quarter is displayed as "C&F" in the UI; there is currently just one.
 */
export const C_AND_F = "JHALAWAR";

/** C&F options for the signup/admin dropdowns — currently only JHALAWAR. */
export const HEAD_QUARTERS = [C_AND_F] as const;

/** Depots under the C&F — outlets belong to one. A rep is assigned one or
 *  more: an SO can cover several depots, an ISR exactly one. */
export const DEPOTS = ["Baran", "Nainwa", "Indergarh"] as const;

/**
 * Coerce untrusted depot input into a clean list for a given role: admins get
 * none, ISRs at most one, SOs any number — all restricted to valid depots.
 */
export function sanitizeDepots(raw: unknown, role: string): string[] {
  if (role === "admin") return [];
  const valid = new Set<string>(DEPOTS);
  const list = Array.isArray(raw)
    ? raw
    : typeof raw === "string" && raw
      ? [raw]
      : [];
  const cleaned = Array.from(
    new Set(list.map((v) => String(v).trim()).filter((v) => valid.has(v))),
  );
  return role === "ISR" ? cleaned.slice(0, 1) : cleaned;
}

/** Areas within each depot (from the JHALAWAR roster). The outlet form also
 *  offers an "Others" choice that reveals a free-text field (see AREA_OTHER). */
export const AREAS_BY_DEPOT: Record<string, string[]> = {
  Baran: [
    "Baran",
    "Bamorikala",
    "Nahargarh",
    "Mangrol",
    "Etawah",
    "Bhanwargarh",
    "Kelwara",
    "Bapawar",
  ],
  Nainwa: ["Nainwa", "Dei", "Bondi", "Laxmipura", "Ranipura", "Bansi"],
  Indergarh: ["Indergarh", "Lakheri", "Sawai Madhopur"],
};

/** Sentinel select value for the outlet Area "Others" (manual-entry) option. */
export const AREA_OTHER = "__other__";

export const DAY_MS = 24 * 60 * 60 * 1000;

/** Deedar brand palette (ported verbatim from the reference design). */
export const C = {
  green: "#1F5C3F",
  greenDark: "#163F2C",
  gold: "#C99A2E",
  cream: "#EDEAE2",
  panel: "#FAF9F6",
  card: "#FFFFFF",
  border: "#E4E1D8",
  ink: "#23241F",
  sub: "#6B6B63",
  muted: "#A6A296",
  goldBg: "#FBF1DD",
  greenBg: "#EAF3EE",
  greenTint: "#CFE3D7",
  danger: "#B23A2E",
  dangerBg: "#FBEAE8",
  dangerBorder: "#E9B7B0",
} as const;

export const EMPTY_ADD_FORM: OutletForm = {
  mobile: "",
  name: "",
  address: "",
  area: "",
  depot: "",
  headQuarter: "",
  type: "",
  typeOther: "",
  lat: "",
  lng: "",
  rank: "",
  competitor: "",
  competitorBrand: "",
  remarks: "",
  items: [],
};

/** A blank product line. Each call returns a fresh object (no shared refs). */
export function makeEmptyVisitItem(): VisitItemForm {
  return { segment: "", stock: "", sold: "" };
}

/** A fresh visit form seeded with one empty product line. */
export function makeEmptyAvForm(): OutletForm {
  return { ...EMPTY_ADD_FORM, items: [makeEmptyVisitItem()] };
}
