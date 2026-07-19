import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { setUserStatus, toPublicUser } from "@/lib/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const status = body.status;
  if (status !== "approved" && status !== "rejected" && status !== "pending") {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const updated = await setUserStatus(id, status);
  if (!updated) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }
  return NextResponse.json({ user: toPublicUser(updated) });
}
