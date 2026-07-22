export type OutletType = "Kirana" | "Tea Stall" | "Wholesale" | "Paan" | "Other";
export type CompetitorLevel = "None" | "Local Brands" | "National Brands";

export interface Gps {
  lat: string;
  lng: string;
}

export interface Visit {
  id: string;
  date: string; // YYYY-MM-DD
  loggedAt?: number; // epoch ms — present for rep-submitted visits (24h edit window)
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
  stock: string;
  sold: string;
  rank: string;
  competitor: CompetitorLevel | "";
  competitorBrand: string;
  remarks: string;
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
