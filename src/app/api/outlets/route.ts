import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { createOutlet, listOutlets } from "@/lib/outlets";

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

  const name = str(body.name);
  if (!name) {
    return NextResponse.json({ error: "Outlet name is required." }, { status: 400 });
  }

  const outlet = await createOutlet(
    {
      name,
      mobile: str(body.mobile),
      area: str(body.area),
      headQuarter: str(body.headQuarter),
      type: str(body.type),
      typeOther: str(body.typeOther),
      lat: str(body.lat),
      lng: str(body.lng),
    },
    auth.id,
  );

  return NextResponse.json({ outlet });
}
