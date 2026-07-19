-- Deedar Field Outlet Tracker — database schema
-- Apply with:  npm run db:setup   (runs this file against DATABASE_URL)
--
-- Note: gen_random_uuid() is a built-in core function in PostgreSQL 13+
-- (no pgcrypto extension needed — Azure Postgres does not allow-list it).

-- ── Users (reps + admins) ──────────────────────────────────────────────
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  phone         text not null unique,
  password_hash text not null,
  division      text not null default '',
  role          text not null default 'user'    check (role   in ('user', 'admin')),
  status        text not null default 'pending'  check (status in ('pending', 'approved', 'rejected')),
  created_at    timestamptz not null default now()
);

-- Add division to an already-created users table (safe to re-run).
alter table users add column if not exists division text not null default '';

create index if not exists idx_users_status on users (status);

-- ── Outlets ────────────────────────────────────────────────────────────
create table if not exists outlets (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  poc         text not null default '',
  mobile      text not null default '',
  address     text not null default '',
  town        text not null default '',
  division    text not null default '',
  type        text not null default '',
  type_other  text not null default '',
  lat         text not null default '',
  lng         text not null default '',
  created_by  uuid references users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_outlets_mobile on outlets (mobile);

-- ── Visits ─────────────────────────────────────────────────────────────
create table if not exists visits (
  id               uuid primary key default gen_random_uuid(),
  outlet_id        uuid not null references outlets (id) on delete cascade,
  visit_date       date not null,
  logged_at        timestamptz not null default now(),
  stock            integer not null default 0,
  sold             integer not null default 0,
  rank             integer not null default 0,
  competitor       text not null default '',
  competitor_brand text not null default '',
  remarks          text not null default '',
  rep              text not null default '',
  created_at       timestamptz not null default now()
);

create index if not exists idx_visits_outlet on visits (outlet_id);
