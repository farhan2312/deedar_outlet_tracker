import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { addVisit, getOutlet, updateOutletIdentity } from "@/lib/outlets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const existing = await getOutlet(id);
  if (!existing) {
    return NextResponse.json({ error: "Outlet not found." }, { status: 404 });
  }

  const str = (v: unknown) => String(v ?? "").trim();
  const num = (v: unknown) => Number(v) || 0;

  // A visit may also carry updated identity fields (the confirm-details step).
  await updateOutletIdentity(id, {
    name: str(body.name) || existing.name,
    poc: str(body.poc),
    mobile: str(body.mobile),
    address: str(body.address),
    town: str(body.town),
    division: str(body.division),
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
