import { NextResponse } from "next/server";
import { getSessionUser, type SessionUser } from "./session";

/**
 * Returns the current user, or a 401/403 response to return early.
 * Usage:
 *   const auth = await requireUser();
 *   if (auth instanceof NextResponse) return auth;
 *   const user = auth;
 */
export async function requireUser(): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }
  return user;
}
