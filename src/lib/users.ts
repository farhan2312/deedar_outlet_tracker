import { query, queryOne } from "./db";

export type UserRole = "admin" | "SO" | "ISR";
export type UserStatus = "pending" | "approved" | "rejected";

export function roleLabel(role: UserRole): string {
  if (role === "admin") return "Admin";
  if (role === "SO") return "SO";
  return "ISR";
}

export interface UserRow {
  id: string;
  name: string;
  phone: string;
  password_hash: string;
  head_quarter: string;
  area: string;
  role: UserRole;
  status: UserStatus;
  must_change_password: boolean;
  reports_to_id: string | null;
  created_at: string;
}

/** Public shape (never exposes password_hash). */
export interface PublicUser {
  id: string;
  name: string;
  phone: string;
  headQuarter: string;
  area: string;
  role: UserRole;
  status: UserStatus;
  reportsToId: string | null;
  createdAt: string;
}

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    headQuarter: row.head_quarter,
    area: row.area,
    role: row.role,
    status: row.status,
    reportsToId: row.reports_to_id,
    createdAt: row.created_at,
  };
}

export function findUserByPhone(phone: string): Promise<UserRow | null> {
  return queryOne<UserRow>("select * from users where phone = $1", [phone]);
}

export function findUserById(id: string): Promise<UserRow | null> {
  return queryOne<UserRow>("select * from users where id = $1", [id]);
}

export function createUser(input: {
  name: string;
  phone: string;
  passwordHash: string;
  headQuarter: string;
  area: string;
  role: UserRole;
}): Promise<UserRow | null> {
  return queryOne<UserRow>(
    `insert into users (name, phone, password_hash, head_quarter, area, role)
     values ($1, $2, $3, $4, $5, $6)
     returning *`,
    [
      input.name,
      input.phone,
      input.passwordHash,
      input.headQuarter,
      input.area,
      input.role,
    ],
  );
}

/**
 * Admin-created user: approved immediately, and forced to set their own
 * password on first login (the admin only sets a temporary one).
 */
export function adminCreateUser(input: {
  name: string;
  phone: string;
  passwordHash: string;
  headQuarter: string;
  area: string;
  role: UserRole;
  reportsToId: string | null;
}): Promise<UserRow | null> {
  return queryOne<UserRow>(
    `insert into users (name, phone, password_hash, head_quarter, area, role, reports_to_id, status, must_change_password)
     values ($1, $2, $3, $4, $5, $6, $7, 'approved', true)
     returning *`,
    [
      input.name,
      input.phone,
      input.passwordHash,
      input.headQuarter,
      input.area,
      input.role,
      input.reportsToId,
    ],
  );
}

export function listUsers(): Promise<UserRow[]> {
  return query<UserRow>(
    `select * from users
     order by
       case status when 'pending' then 0 when 'approved' then 1 else 2 end,
       created_at desc`,
  );
}

export function setUserStatus(
  id: string,
  status: UserStatus,
): Promise<UserRow | null> {
  return queryOne<UserRow>(
    "update users set status = $2 where id = $1 returning *",
    [id, status],
  );
}

/**
 * Admin edit of a user's details and access. Only keys actually present in
 * `fields` are changed — this lets `reportsToId` be explicitly cleared with
 * `null` while other fields stay untouched (a plain coalesce can't tell
 * "clear this" apart from "leave it alone" for a nullable column).
 */
export function adminUpdateUser(
  id: string,
  fields: {
    name?: string;
    phone?: string;
    headQuarter?: string;
    area?: string;
    role?: UserRole;
    status?: UserStatus;
    reportsToId?: string | null;
  },
): Promise<UserRow | null> {
  const columns: Record<string, string> = {
    name: "name",
    phone: "phone",
    headQuarter: "head_quarter",
    area: "area",
    role: "role",
    status: "status",
    reportsToId: "reports_to_id",
  };

  const sets: string[] = [];
  const values: unknown[] = [id];
  for (const [key, column] of Object.entries(columns)) {
    if (key in fields) {
      values.push((fields as Record<string, unknown>)[key]);
      sets.push(`${column} = $${values.length}`);
    }
  }

  if (sets.length === 0) return findUserById(id);

  return queryOne<UserRow>(
    `update users set ${sets.join(", ")} where id = $1 returning *`,
    values,
  );
}

/** Set a new password and clear the forced-reset flag. */
export function updateUserPassword(
  id: string,
  passwordHash: string,
): Promise<UserRow | null> {
  return queryOne<UserRow>(
    `update users
       set password_hash = $2, must_change_password = false
     where id = $1
     returning *`,
    [id, passwordHash],
  );
}
