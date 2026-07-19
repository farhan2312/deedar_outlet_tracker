# Deedar — Field Outlet Tracker

A [Next.js](https://nextjs.org) (App Router) field-sales app: reps sign up, an admin
approves access, and approved reps onboard outlets and record visits — all backed by
Azure Postgres.

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4
- Postgres (Azure) via `pg` (raw SQL, no ORM)
- Auth: bcrypt password hashing + signed JWT session cookie (`jose`)

## Setup

### 1. Install

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in:

- `DATABASE_URL` — your Azure Postgres connection string (`...?sslmode=require`)
- `SESSION_SECRET` — a long random string (`node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`)
- `ADMIN_NAME` / `ADMIN_PHONE` / `ADMIN_PASSWORD` — the first admin account

`.env.local` is git-ignored — never commit it.

### 3. Create the database tables

```bash
npm run db:setup
```

Applies [`db/schema.sql`](db/schema.sql) (users, outlets, visits) to your database.

### 4. Create the first admin

```bash
npm run create-admin
```

Reads the `ADMIN_*` values and creates an approved admin (idempotent — rerun to reset).

### 4b. (Optional) Import the sales team

```bash
npm run import-employees
```

Imports the roster in [`db/rajasthan-employees.json`](db/rajasthan-employees.json)
(name, mobile, division) as **approved** reps. Each salesman's **initial password
is their own 10-digit mobile number**, and they are **forced to set a new password
on first login** (they can't reach the app until they do). Idempotent (re-running
updates name/division, never resets passwords).

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

| Route      | Who        | Purpose                                             |
| ---------- | ---------- | --------------------------------------------------- |
| `/signup`  | anyone     | Request access (name, phone, role, division, password) → pending |
| `/login`   | anyone     | Sign in with phone + password                       |
| `/`        | approved   | The tracker app (dashboard, add outlet, add visit)  |
| `/admin`   | admin only | Add users, edit users, and manage access            |

New signups are **pending** and cannot log in until an admin approves them at `/admin`.
Route protection is enforced in [`src/middleware.ts`](src/middleware.ts) and re-checked
in each page and API handler.

Users have a **role** — `field_rep` (belongs to a division) or `admin`. Signup lets you
pick either; admin signups are still pending until an existing admin approves them.

From the `/admin` panel an admin can **add users** (name, phone, role, division, optional
temporary password — defaults to the phone number) and **edit any user** — name, mobile,
role, division, and access status (pending / approved / rejected). Admin-created users are
approved immediately and, like imported reps, are **forced to set a new password on first
login**.

When a field rep adds an outlet, its **Division field is prefilled with the rep's own
division**.

## Scripts

| Command               | Description                          |
| --------------------- | ------------------------------------ |
| `npm run dev`         | Start the dev server                 |
| `npm run build`       | Production build                     |
| `npm start`          | Run the production build             |
| `npm run lint`        | Lint                                 |
| `npm run db:setup`    | Apply the SQL schema                 |
| `npm run create-admin`| Create/refresh the admin account     |
| `npm run import-employees` | Import the Rajasthan sales roster |

## Structure

See [ARCHITECTURE.md](./ARCHITECTURE.md). Feature code lives in `src/features/*`;
server/data/auth helpers in `src/lib/*`; API route handlers in `src/app/api/*`.
