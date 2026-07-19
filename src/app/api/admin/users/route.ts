import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { listUsers, toPublicUser } from "@/lib/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const users = await listUsers();
  return NextResponse.json({ users: users.map(toPublicUser) });
}
