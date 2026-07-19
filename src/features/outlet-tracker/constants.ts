import type { CompetitorLevel, Division, OutletForm, OutletType } from "./types";

export const TYPES: OutletType[] = [
  "Kirana",
  "Tea Stall",
  "Wholesale",
  "Paan",
  "Other",
];

export const DIVISIONS: Division[] = [
  "Bihar",
  "Uttar Pradesh",
  "Rajasthan",
  "Madhya Pradesh",
];

export const COMPETITOR_LEVELS: CompetitorLevel[] = [
  "None",
  "Local Brands",
  "National Brands",
];

export const DEMO_PASSWORD = "deedar12345";

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
  poc: "",
  address: "",
  town: "",
  division: "",
  type: "",
  typeOther: "",
  lat: "",
  lng: "",
  stock: "",
  sold: "",
  rank: "",
  competitor: "",
  competitorBrand: "",
  remarks: "",
};

export const EMPTY_RV_FORM: OutletForm = { ...EMPTY_ADD_FORM };
