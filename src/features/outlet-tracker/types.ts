export type OutletType = "Kirana" | "Tea Stall" | "Wholesale" | "Paan" | "Other";
export type CompetitorLevel = "None" | "Local Brands" | "National Brands";

/** The four Deedar product segments a rep records sales against. */
export type ProductSegment = "DG10" | "DG20" | "DB20" | "DB40";

export interface Gps {
  lat: string;
  lng: string;
}

/** One product-segment line within a visit (domain model — numeric). */
export interface VisitItem {
  segment: ProductSegment | ""; // "" only for legacy pre-segment visits
  stock: number;
  sold: number;
  rank: number;
}

export interface Visit {
  id: string;
  date: string; // YYYY-MM-DD
  loggedAt?: number; // epoch ms — present for rep-submitted visits (24h edit window)
  items: VisitItem[]; // per-segment breakdown (source of truth)
  // Convenience totals derived from items: stock/sold summed, rank = best (min).
  stock: number;
  sold: number;
  rank: number;
  competitor: CompetitorLevel | "";
  competitorBrand: string;
  remarks: string;
  rep: string;
}

export interface Outlet {
  id: string;
  name: string;
  mobile: string;
  address: string;
  area: string;
  headQuarter: string;
  type: string;
  typeOther: string;
  gps: Gps;
  visits: Visit[];
}

export type Screen =
  | "login"
  | "dashboard"
  | "outletDetail"
  | "addOutlet"
  | "addVisitFind"
  | "addVisit"
  | "editVisit";

/** Form-side product line (string inputs, converted to VisitItem on submit). */
export interface VisitItemForm {
  segment: ProductSegment | "";
  stock: string;
  sold: string;
  rank: string;
}

/** Shared shape for the add-outlet and record-visit forms. */
export interface OutletForm {
  mobile: string;
  name: string;
  address: string;
  area: string;
  headQuarter: string;
  type: string;
  typeOther: string;
  lat: string;
  lng: string;
  competitor: CompetitorLevel | "";
  competitorBrand: string;
  remarks: string;
  items: VisitItemForm[]; // per-segment sales lines (visit flow only)
}

export type GpsStatus = "idle" | "capturing" | "success" | "error";

export interface IdentityForm {
  name: string;
  mobile: string;
  address: string;
  area: string;
  headQuarter: string;
  type: string;
  typeOther: string;
}

export interface TrackerState {
  screen: Screen;
  repMobile: string;
  outlets: Outlet[];
  loading: boolean;
  toast: string;
  dashSearch: string;
  selectedOutletId: string | null;
  editingIdentity: boolean;
  editForm: Partial<IdentityForm>;
  addStep: number;
  addForm: OutletForm;
  addDuplicateOutletId: string | null;
  addGpsStatus: GpsStatus;
  addGpsErrorMsg: string;
  avMobile: string;
  avStep: number;
  avForm: OutletForm;
  editVisitOutletId: string | null;
  editVisitId: string | null;
  editVisitForm: Partial<OutletForm>;
}
