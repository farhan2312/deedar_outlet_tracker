import { NextResponse } from "next/server";
import { createUser, findUserByPhone } from "@/lib/users";
import { hashPassword } from "@/lib/password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizePhone(v: unknown): string {
  return String(v ?? "").replace(/[^0-9]/g, "").slice(0, 10);
}

export async function POST(req: Request) {
  let body: { name?: string; phone?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const phone = normalizePhone(body.phone);
  const password = String(body.password ?? "");

  if (name.length < 2) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (phone.length !== 10) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit mobile number." },
      { status: 400 },
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }

  const existing = await findUserByPhone(phone);
  if (existing) {
    return NextResponse.json(
      { error: "An account with this mobile number already exists." },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);
  await createUser({ name, phone, passwordHash });

  return NextResponse.json({
    ok: true,
    message: "Account created. An admin will review and approve your access.",
  });
}
