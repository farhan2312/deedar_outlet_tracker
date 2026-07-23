import { query, queryOne } from "./db";
import { todayIST } from "./date";
import type {
  Outlet,
  ProductSegment,
  Visit,
  VisitItem,
} from "@/features/outlet-tracker/types";
import type { UserRole } from "./users";

const VALID_SEGMENTS = new Set<string>(["DG10", "DG20", "DB20", "DB40"]);

/**
 * Coerce an untrusted `items` payload (from a request body or a jsonb column)
 * into clean VisitItems, dropping any line without a recognised segment.
 */
export function sanitizeVisitItems(raw: unknown): VisitItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r) => {
      const o = (r ?? {}) as Record<string, unknown>;
      const segment = String(o.segment ?? "").trim();
      return {
        segment: (VALID_SEGMENTS.has(segment)
          ? segment
          : "") as VisitItem["segment"],
        stock: Number(o.stock) || 0,
        sold: Number(o.sold) || 0,
      };
    })
    .filter((it) => it.segment);
}

/** Visit-level stock/sold totals summed across the product lines. */
function totalsOf(items: VisitItem[]): { stock: number; sold: number } {
  const stock = items.reduce((s, it) => s + it.stock, 0);
  const sold = items.reduce((s, it) => s + it.sold, 0);
  return { stock, sold };
}

/**
 * SQL fragment: ids of users whose outlets a given user (bound to
 * placeholder `$paramIndex`) may see — themselves, their supervising SO (if
 * they're an ISR), and their reporting ISRs (if they're an SO). Used as
 * `created_by in (${teamScopeSql(paramIndex)})`.
 */
function teamScopeSql(paramIndex: number): string {
  const p = `$${paramIndex}`;
  return `
    select id from users where id = ${p}
    union
    select id from users where reports_to_id = ${p}
    union
    select reports_to_id from users where id = ${p} and reports_to_id is not null
  `;
}

interface OutletRow {
  id: string;
  name: string;
  mobile: string;
  address: string;
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
  items: Array<{
    segment?: string;
    stock?: number;
    sold?: number;
  }> | null;
  stock: number;
  sold: number;
  rank: number;
  competitor: string;
  competitor_brand: string;
  remarks: string;
  rep: string;
}

function mapVisit(v: VisitRow): Visit {
  const items: VisitItem[] = Array.isArray(v.items)
    ? v.items.map((it) => ({
        segment: (it?.segment ?? "") as ProductSegment | "",
        stock: Number(it?.stock) || 0,
        sold: Number(it?.sold) || 0,
      }))
    : [];
  return {
    id: v.id,
    date:
      typeof v.visit_date === "string"
        ? v.visit_date.slice(0, 10)
        : new Date(v.visit_date).toISOString().slice(0, 10),
    loggedAt: v.logged_at ? new Date(v.logged_at).getTime() : undefined,
    items,
    rank: v.rank,
    stock: v.stock,
    sold: v.sold,
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
    address: o.address,
    area: o.area,
    headQuarter: o.head_quarter,
    type: o.type,
    typeOther: o.type_other,
    gps: { lat: o.lat, lng: o.lng },
    visits: visits.map(mapVisit),
  };
}

/**
 * Outlets visible to `userId`, with their visits, sorted by most recent
 * visit. Admins see everything; everyone else sees only outlets created by
 * themselves or by their teammate (an ISR's supervising SO, or an SO's own
 * reporting ISRs) — see teamScopeSql().
 */
export async function listOutlets(
  userId: string,
  role: UserRole,
): Promise<Outlet[]> {
  const outlets =
    role === "admin"
      ? await query<OutletRow>("select * from outlets")
      : await query<OutletRow>(
          `select * from outlets where created_by in (${teamScopeSql(1)})`,
          [userId],
        );
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

/** Whether `userId` (with `role`) may view/edit the given outlet. */
export async function isOutletInScope(
  outletId: string,
  userId: string,
  role: UserRole,
): Promise<boolean> {
  if (role === "admin") return true;
  const row = await queryOne<{ ok: boolean }>(
    `select exists (
       select 1 from outlets o
       where o.id = $1 and o.created_by in (${teamScopeSql(2)})
     ) as ok`,
    [outletId, userId],
  );
  return row?.ok === true;
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
  address: string;
  area: string;
  headQuarter: string;
  type: string;
  typeOther: string;
  lat: string;
  lng: string;
}

export interface VisitInput {
  items: VisitItem[];
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
       (name, mobile, address, area, head_quarter, type, type_other, lat, lng, created_by)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     returning *`,
    [
      outlet.name,
      outlet.mobile,
      outlet.address,
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
       name = $2, mobile = $3, address = $4, area = $5, head_quarter = $6, type = $7, type_other = $8
     where id = $1`,
    [
      id,
      outlet.name,
      outlet.mobile,
      outlet.address,
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
  const totals = totalsOf(visit.items);
  await query(
    `insert into visits
       (outlet_id, visit_date, items, stock, sold, rank, competitor, competitor_brand, remarks, rep)
     values ($1, $2, $3::jsonb, $4, $5, $6, $7, $8, $9, $10)`,
    [
      outletId,
      todayIST(),
      JSON.stringify(visit.items),
      totals.stock,
      totals.sold,
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
  const totals = totalsOf(visit.items);
  const rows = await query(
    `update visits set
       items = $3::jsonb, stock = $4, sold = $5, rank = $6,
       competitor = $7, competitor_brand = $8, remarks = $9
     where id = $1
       and rep = $2
       and logged_at > now() - interval '24 hours'
     returning id`,
    [
      visitId,
      rep,
      JSON.stringify(visit.items),
      totals.stock,
      totals.sold,
      visit.rank,
      visit.competitor,
      visit.competitorBrand,
      visit.remarks,
    ],
  );
  return rows.length > 0;
}
