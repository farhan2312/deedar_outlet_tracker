import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { adminUpdateUser, toPublicUser, type UserRole, type UserStatus } from "@/lib/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizePhone(v: unknown): string {
  return String(v ?? "").replace(/[^0-9]/g, "").slice(0, 10);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  let body: {
    name?: string;
    phone?: string;
    division?: string;
    role?: string;
    status?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const fields: {
    name?: string;
    phone?: string;
    division?: string;
    role?: UserRole;
    status?: UserStatus;
  } = {};

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (name.length < 2) {
      return NextResponse.json({ error: "Please enter a name." }, { status: 400 });
    }
    fields.name = name;
  }
  if (body.phone !== undefined) {
    const phone = normalizePhone(body.phone);
    if (phone.length !== 10) {
      return NextResponse.json(
        { error: "Enter a valid 10-digit mobile number." },
        { status: 400 },
      );
    }
    fields.phone = phone;
  }
  if (body.role !== undefined) {
    if (body.role !== "field_rep" && body.role !== "admin") {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }
    fields.role = body.role;
  }
  if (body.status !== undefined) {
    if (
      body.status !== "pending" &&
      body.status !== "approved" &&
      body.status !== "rejected"
    ) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    fields.status = body.status;
  }
  if (body.division !== undefined) {
    // Admins have no division.
    const targetRole = fields.role;
    fields.division =
      targetRole === "admin" ? "" : String(body.division).trim();
  }

  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  try {
    const updated = await adminUpdateUser(id, fields);
    if (!updated) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    return NextResponse.json({ user: toPublicUser(updated) });
  } catch (e) {
    // Unique-violation on phone.
    if (e && typeof e === "object" && "code" in e && e.code === "23505") {
      return NextResponse.json(
        { error: "Another account already uses this mobile number." },
        { status: 409 },
      );
    }
    throw e;
  }
}
