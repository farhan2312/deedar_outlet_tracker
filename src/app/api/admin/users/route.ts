import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { adminCreateUser, findUserByPhone, listUsers, toPublicUser } from "@/lib/users";
import { hashPassword } from "@/lib/password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const users = await listUsers();
  return NextResponse.json({ users: users.map(toPublicUser) });
}

function normalizePhone(v: unknown): string {
  return String(v ?? "").replace(/[^0-9]/g, "").slice(0, 10);
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  let body: {
    name?: string;
    phone?: string;
    headQuarter?: string;
    area?: string;
    password?: string;
    role?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const phone = normalizePhone(body.phone);
  const role =
    body.role === "admin" ? "admin" : body.role === "SO" ? "SO" : "ISR";
  const headQuarter = role === "admin" ? "" : String(body.headQuarter ?? "").trim();
  const area = role === "admin" ? "" : String(body.area ?? "").trim();
  // Admin may set a temporary password; defaults to the phone number.
  const password = String(body.password ?? "") || phone;

  if (name.length < 2) {
    return NextResponse.json({ error: "Please enter a name." }, { status: 400 });
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
  const user = await adminCreateUser({
    name,
    phone,
    passwordHash,
    headQuarter,
    area,
    role,
  });

  return NextResponse.json({ user: user ? toPublicUser(user) : null });
}
