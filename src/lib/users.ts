import { query, queryOne } from "./db";

export type UserRole = "field_rep" | "admin";
export type UserStatus = "pending" | "approved" | "rejected";

export function roleLabel(role: UserRole): string {
  return role === "admin" ? "Admin" : "Field Rep";
}

export interface UserRow {
  id: string;
  name: string;
  phone: string;
  password_hash: string;
  division: string;
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
  division: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    division: row.division,
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
  division: string;
  role: UserRole;
}): Promise<UserRow | null> {
  return queryOne<UserRow>(
    `insert into users (name, phone, password_hash, division, role)
     values ($1, $2, $3, $4, $5)
     returning *`,
    [input.name, input.phone, input.passwordHash, input.division, input.role],
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
  division: string;
  role: UserRole;
}): Promise<UserRow | null> {
  return queryOne<UserRow>(
    `insert into users (name, phone, password_hash, division, role, status, must_change_password)
     values ($1, $2, $3, $4, $5, 'approved', true)
     returning *`,
    [input.name, input.phone, input.passwordHash, input.division, input.role],
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
    division?: string;
    role?: UserRole;
    status?: UserStatus;
  },
): Promise<UserRow | null> {
  return queryOne<UserRow>(
    `update users set
       name     = coalesce($2, name),
       phone    = coalesce($3, phone),
       division = coalesce($4, division),
       role     = coalesce($5, role),
       status   = coalesce($6, status)
     where id = $1
     returning *`,
    [
      id,
      fields.name ?? null,
      fields.phone ?? null,
      fields.division ?? null,
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
