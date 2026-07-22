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
}): Promise<UserRow | null> {
  return queryOne<UserRow>(
    `insert into users (name, phone, password_hash, head_quarter, area, role, status, must_change_password)
     values ($1, $2, $3, $4, $5, $6, 'approved', true)
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

/** Admin edit of a user's details and access. Only provided fields change. */
export function adminUpdateUser(
  id: string,
  fields: {
    name?: string;
    phone?: string;
    headQuarter?: string;
    area?: string;
    role?: UserRole;
    status?: UserStatus;
  },
): Promise<UserRow | null> {
  return queryOne<UserRow>(
    `update users set
       name         = coalesce($2, name),
       phone        = coalesce($3, phone),
       head_quarter = coalesce($4, head_quarter),
       area         = coalesce($5, area),
       role         = coalesce($6, role),
       status       = coalesce($7, status)
     where id = $1
     returning *`,
    [
      id,
      fields.name ?? null,
      fields.phone ?? null,
      fields.headQuarter ?? null,
      fields.area ?? null,
      fields.role ?? null,
      fields.status ?? null,
    ],
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
