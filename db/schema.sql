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
  head_quarter  text not null default '',
  area          text not null default '',
  role          text not null default 'ISR' check (role in ('admin', 'SO', 'ISR')),
  status        text not null default 'pending'  check (status in ('pending', 'approved', 'rejected')),
  must_change_password boolean not null default false,
  reports_to_id uuid references users (id) on delete set null,
  created_at    timestamptz not null default now()
);

-- Add later columns to an already-created users table (safe to re-run).
alter table users add column if not exists must_change_password boolean not null default false;
-- An ISR's supervising SO (nullable — not every ISR has one assigned yet).
alter table users add column if not exists reports_to_id uuid references users (id) on delete set null;

-- Rename the old 'division' column to 'head_quarter' (safe to re-run — only
-- fires if the old column still exists, i.e. on a pre-rename database).
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'users' and column_name = 'division'
  ) then
    alter table users rename column division to head_quarter;
  end if;
end $$;
alter table users add column if not exists head_quarter text not null default '';
alter table users add column if not exists area text not null default '';

-- Migrate legacy role values to the admin/SO/ISR model (safe to re-run).
-- Drop the constraint first so the UPDATE doesn't violate the old allowed set.
alter table users drop constraint if exists users_role_check;
update users set role = 'ISR' where role in ('user', 'field_rep');
alter table users alter column role set default 'ISR';
alter table users add constraint users_role_check check (role in ('admin', 'SO', 'ISR'));

create index if not exists idx_users_status on users (status);

-- ── Outlets ────────────────────────────────────────────────────────────
create table if not exists outlets (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  mobile       text not null default '',
  address      text not null default '',
  area         text not null default '',
  head_quarter text not null default '',
  type         text not null default '',
  type_other   text not null default '',
  lat          text not null default '',
  lng          text not null default '',
  created_by   uuid references users (id) on delete set null,
  created_at   timestamptz not null default now()
);

-- Rename town/division to area/head_quarter (safe to re-run).
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'outlets' and column_name = 'town'
  ) then
    alter table outlets rename column town to area;
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_name = 'outlets' and column_name = 'division'
  ) then
    alter table outlets rename column division to head_quarter;
  end if;
end $$;
alter table outlets add column if not exists area text not null default '';
alter table outlets add column if not exists head_quarter text not null default '';

-- Point of Contact is no longer collected — dropped (destructive, one-time).
alter table outlets drop column if exists poc;

-- Address was dropped, then reinstated as an optional field — re-add it
-- (safe to re-run; a no-op once the column exists).
alter table outlets add column if not exists address text not null default '';

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
