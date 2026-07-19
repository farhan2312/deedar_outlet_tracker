import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { createOutletWithVisit, listOutlets } from "@/lib/outlets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  const outlets = await listOutlets();
  return NextResponse.json({ outlets });
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const str = (v: unknown) => String(v ?? "").trim();
  const num = (v: unknown) => Number(v) || 0;

  const name = str(body.name);
  if (!name) {
    return NextResponse.json({ error: "Outlet name is required." }, { status: 400 });
  }

  const outlet = await createOutletWithVisit(
    {
      name,
      poc: str(body.poc),
      mobile: str(body.mobile),
      address: str(body.address),
      town: str(body.town),
      division: str(body.division),
      type: str(body.type),
      typeOther: str(body.typeOther),
      lat: str(body.lat),
      lng: str(body.lng),
    },
    {
      stock: num(body.stock),
      sold: num(body.sold),
      rank: num(body.rank),
      competitor: str(body.competitor),
      competitorBrand: str(body.competitorBrand),
      remarks: str(body.remarks),
    },
    auth.phone,
    auth.id,
  );

  return NextResponse.json({ outlet });
}
