import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { updateUserPassword } from "@/lib/users";
import { hashPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const password = String(body.password ?? "");
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }
  // Force an actual change: don't allow keeping the mobile-number default.
  if (password === auth.phone) {
    return NextResponse.json(
      { error: "Please choose a password different from your mobile number." },
      { status: 400 },
    );
  }

  const hash = await hashPassword(password);
  const updated = await updateUserPassword(auth.id, hash);
  if (!updated) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  // Re-issue the session so the forced-reset flag is cleared.
  await setSessionCookie({
    id: auth.id,
    name: auth.name,
    phone: auth.phone,
    division: auth.division,
    role: auth.role,
    mustChange: false,
  });

  return NextResponse.json({ ok: true });
}
