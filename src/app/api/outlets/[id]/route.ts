import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { updateOutletIdentity } from "@/lib/outlets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
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

  const str = (v: unknown) => String(v ?? "").trim();
  const name = str(body.name);
  if (!name) {
    return NextResponse.json({ error: "Outlet name is required." }, { status: 400 });
  }

  const outlet = await updateOutletIdentity(id, {
    name,
    poc: str(body.poc),
    mobile: str(body.mobile),
    address: str(body.address),
    town: str(body.town),
    division: str(body.division),
    type: str(body.type),
    typeOther: str(body.typeOther),
  });

  if (!outlet) {
    return NextResponse.json({ error: "Outlet not found." }, { status: 404 });
  }
  return NextResponse.json({ outlet });
}
