import { query, queryOne } from "./db";
import { todayIST } from "./date";
import type { Outlet, Visit } from "@/features/outlet-tracker/types";

interface OutletRow {
  id: string;
  name: string;
  mobile: string;
  area: string;
  head_quarter: string;
  type: string;
  type_other: string;
  lat: string;
  lng: string;
  created_at: string;
}

interface VisitRow {
  id: string;
  outlet_id: string;
  visit_date: string;
  logged_at: string;
  stock: number;
  sold: number;
  rank: number;
  competitor: string;
  competitor_brand: string;
  remarks: string;
  rep: string;
}

function mapVisit(v: VisitRow): Visit {
  return {
    id: v.id,
    date:
      typeof v.visit_date === "string"
        ? v.visit_date.slice(0, 10)
        : new Date(v.visit_date).toISOString().slice(0, 10),
    loggedAt: v.logged_at ? new Date(v.logged_at).getTime() : undefined,
    stock: v.stock,
    sold: v.sold,
    rank: v.rank,
    competitor: (v.competitor || "") as Visit["competitor"],
    competitorBrand: v.competitor_brand || "",
    remarks: v.remarks || "",
    rep: v.rep || "",
  };
}

function mapOutlet(o: OutletRow, visits: VisitRow[]): Outlet {
  return {
    id: o.id,
    name: o.name,
    mobile: o.mobile,
    area: o.area,
    headQuarter: o.head_quarter,
    type: o.type,
    typeOther: o.type_other,
    gps: { lat: o.lat, lng: o.lng },
    visits: visits.map(mapVisit),
  };
}

/** All outlets with their visits, sorted by most recent visit. */
export async function listOutlets(): Promise<Outlet[]> {
  const outlets = await query<OutletRow>("select * from outlets");
  const visits = await query<VisitRow>(
    "select * from visits order by visit_date asc, logged_at asc",
  );
  const byOutlet = new Map<string, VisitRow[]>();
  for (const v of visits) {
    const arr = byOutlet.get(v.outlet_id) ?? [];
    arr.push(v);
    byOutlet.set(v.outlet_id, arr);
  }
  return outlets.map((o) => mapOutlet(o, byOutlet.get(o.id) ?? []));
}

export async function getOutlet(id: string): Promise<Outlet | null> {
  const o = await queryOne<OutletRow>("select * from outlets where id = $1", [
    id,
  ]);
  if (!o) return null;
  const visits = await query<VisitRow>(
    "select * from visits where outlet_id = $1 order by visit_date asc, logged_at asc",
    [id],
  );
  return mapOutlet(o, visits);
}

export interface OutletInput {
  name: string;
  mobile: string;
  area: string;
  headQuarter: string;
  type: string;
  typeOther: string;
  lat: string;
  lng: string;
}

export interface VisitInput {
  stock: number;
  sold: number;
  rank: number;
  competitor: string;
  competitorBrand: string;
  remarks: string;
}

/** Creates an outlet record only — no visit. Reps log visits separately. */
export async function createOutlet(
  outlet: OutletInput,
  createdBy: string,
): Promise<Outlet | null> {
  const row = await queryOne<OutletRow>(
    `insert into outlets
       (name, mobile, area, head_quarter, type, type_other, lat, lng, created_by)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     returning *`,
    [
      outlet.name,
      outlet.mobile,
      outlet.area,
      outlet.headQuarter,
      outlet.type,
      outlet.typeOther,
      outlet.lat,
      outlet.lng,
      createdBy,
    ],
  );
  if (!row) return null;
  return getOutlet(row.id);
}

export async function updateOutletIdentity(
  id: string,
  outlet: Omit<OutletInput, "lat" | "lng">,
): Promise<Outlet | null> {
  await query(
    `update outlets set
       name = $2, mobile = $3, area = $4, head_quarter = $5, type = $6, type_other = $7
     where id = $1`,
    [
      id,
      outlet.name,
      outlet.mobile,
      outlet.area,
      outlet.headQuarter,
      outlet.type,
      outlet.typeOther,
    ],
  );
  return getOutlet(id);
}

export async function addVisit(
  outletId: string,
  visit: VisitInput,
  rep: string,
): Promise<void> {
  await query(
    `insert into visits
       (outlet_id, visit_date, stock, sold, rank, competitor, competitor_brand, remarks, rep)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      outletId,
      todayIST(),
      visit.stock,
      visit.sold,
      visit.rank,
      visit.competitor,
      visit.competitorBrand,
      visit.remarks,
      rep,
    ],
  );
}

/** Update a visit only if it is still within the 24h edit window and owned by `rep`. */
export async function updateVisitWithinWindow(
  visitId: string,
  rep: string,
  visit: VisitInput,
): Promise<boolean> {
  const rows = await query(
    `update visits set
       stock = $3, sold = $4, rank = $5,
       competitor = $6, competitor_brand = $7, remarks = $8
     where id = $1
       and rep = $2
       and logged_at > now() - interval '24 hours'
     returning id`,
    [
      visitId,
      rep,
      visit.stock,
      visit.sold,
      visit.rank,
      visit.competitor,
      visit.competitorBrand,
      visit.remarks,
    ],
  );
  return rows.length > 0;
}
