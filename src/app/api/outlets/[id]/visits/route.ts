import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import {
  addVisit,
  getOutlet,
  isOutletInScope,
  updateOutletIdentity,
} from "@/lib/outlets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  if (auth.role === "SO") {
    return NextResponse.json(
      { error: "SO accounts cannot record visits." },
      { status: 403 },
    );
  }

  const { id } = await params;

  if (!(await isOutletInScope(id, auth.id, auth.role))) {
    return NextResponse.json({ error: "Counter not found." }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const existing = await getOutlet(id);
  if (!existing) {
    return NextResponse.json({ error: "Counter not found." }, { status: 404 });
  }

  const str = (v: unknown) => String(v ?? "").trim();
  const num = (v: unknown) => Number(v) || 0;

  // The client sends the outlet's current identity fields alongside the visit
  // (unedited — Add Visit doesn't let reps change identity), so this is a no-op
  // in practice but keeps the row consistent if the outlet changed mid-flow.
  await updateOutletIdentity(id, {
    name: str(body.name) || existing.name,
    mobile: str(body.mobile),
    address: str(body.address),
    area: str(body.area),
    headQuarter: str(body.headQuarter),
    type: str(body.type),
    typeOther: str(body.typeOther),
  });

  await addVisit(
    id,
    {
      stock: num(body.stock),
      sold: num(body.sold),
      rank: num(body.rank),
      competitor: str(body.competitor),
      competitorBrand: str(body.competitorBrand),
      remarks: str(body.remarks),
    },
    auth.phone,
  );

  const outlet = await getOutlet(id);
  return NextResponse.json({ outlet });
}
