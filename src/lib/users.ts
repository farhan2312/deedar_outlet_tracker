import { query, queryOne } from "./db";

export type UserRole = "user" | "admin";
export type UserStatus = "pending" | "approved" | "rejected";

export interface UserRow {
  id: string;
  name: string;
  phone: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

/** Public shape (never exposes password_hash). */
export interface PublicUser {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
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
}): Promise<UserRow | null> {
  return queryOne<UserRow>(
    `insert into users (name, phone, password_hash)
     values ($1, $2, $3)
     returning *`,
    [input.name, input.phone, input.passwordHash],
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
