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

/** Head quarters a rep (SO/ISR) can belong to (from the DEEDAR_USER roster). */
export const HEAD_QUARTERS = ["Jaipur", "Kota", "Indore", "Banda"] as const;

/** Areas (sales routes) within each head quarter, from the DEEDAR_USER roster. */
export const AREAS_BY_HEAD_QUARTER: Record<string, string[]> = {
  Jaipur: [
    "Bagru",
    "Chomu",
    "Fatehpur",
    "Karbala",
    "Niwai",
    "Rawatsar",
    "Sanganer",
    "Todarraisingh",
  ],
  Kota: [
    "Aklera",
    "Baran",
    "Bhawanimandi",
    "Jhalawar",
    "Kanwas",
    "Khanpur",
    "Lakheri",
    "Nainwa",
    "Neemach Rampura",
    "Sawai Madhopur",
  ],
  Indore: ["Alirajpur", "Indore", "Kukshi", "Manavar", "Vidisha"],
  Banda: ["Banda"],
};

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
