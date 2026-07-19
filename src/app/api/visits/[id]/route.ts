import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { updateVisitWithinWindow } from "@/lib/outlets";

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

  const num = (v: unknown) => Number(v) || 0;
  const str = (v: unknown) => String(v ?? "").trim();

  const ok = await updateVisitWithinWindow(id, auth.phone, {
    stock: num(body.stock),
    sold: num(body.sold),
    rank: num(body.rank),
    competitor: str(body.competitor),
    competitorBrand: str(body.competitorBrand),
    remarks: str(body.remarks),
  });

  if (!ok) {
    return NextResponse.json(
      { error: "This visit can no longer be edited (24h window passed)." },
      { status: 403 },
    );
  }
  return NextResponse.json({ ok: true });
}
