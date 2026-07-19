import { NextResponse } from "next/server";
import { findUserByPhone } from "@/lib/users";
import { verifyPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizePhone(v: unknown): string {
  return String(v ?? "").replace(/[^0-9]/g, "").slice(0, 10);
}

export async function POST(req: Request) {
  let body: { phone?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const phone = normalizePhone(body.phone);
  const password = String(body.password ?? "");

  const user = await findUserByPhone(phone);
  // Generic message for wrong phone or password (don't reveal which).
  const invalid = NextResponse.json(
    { error: "Invalid mobile number or password." },
    { status: 401 },
  );
  if (!user) return invalid;

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return invalid;

  if (user.status === "pending") {
    return NextResponse.json(
      { error: "Your account is awaiting admin approval." },
      { status: 403 },
    );
  }
  if (user.status === "rejected") {
    return NextResponse.json(
      { error: "Your access request was rejected. Contact your admin." },
      { status: 403 },
    );
  }

  await setSessionCookie({
    id: user.id,
    name: user.name,
    phone: user.phone,
    division: user.division,
    role: user.role,
    mustChange: user.must_change_password,
  });

  return NextResponse.json({
    ok: true,
    mustChange: user.must_change_password,
    user: { name: user.name, phone: user.phone, role: user.role },
  });
}
