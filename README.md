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

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

| Route      | Who        | Purpose                                             |
| ---------- | ---------- | --------------------------------------------------- |
| `/signup`  | anyone     | Rep requests access (name, phone, password) → pending |
| `/login`   | anyone     | Sign in with phone + password                       |
| `/`        | approved   | The tracker app (dashboard, add outlet, record visit) |
| `/admin`   | admin only | Approve / reject / revoke rep access                |

New signups are **pending** and cannot log in until an admin approves them at `/admin`.
Route protection is enforced in [`src/middleware.ts`](src/middleware.ts) and re-checked
in each page and API handler.

## Scripts

| Command               | Description                          |
| --------------------- | ------------------------------------ |
| `npm run dev`         | Start the dev server                 |
| `npm run build`       | Production build                     |
| `npm start`          | Run the production build             |
| `npm run lint`        | Lint                                 |
| `npm run db:setup`    | Apply the SQL schema                 |
| `npm run create-admin`| Create/refresh the admin account     |

## Structure

See [ARCHITECTURE.md](./ARCHITECTURE.md). Feature code lives in `src/features/*`;
server/data/auth helpers in `src/lib/*`; API route handlers in `src/app/api/*`.
