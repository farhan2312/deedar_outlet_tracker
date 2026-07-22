# Deedar — Field Outlet Tracker

A [Next.js](https://nextjs.org) (App Router) field-sales app: reps sign up, an admin
approves access, and approved reps onboard outlets and record visits — all backed by
Azure Postgres.

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4
- Postgres (Azure) via `pg` (raw SQL, no ORM)
- Auth: bcrypt password hashing + signed JWT session cookie (`jose`)
- Bilingual UI (English / Hindi) — see below

## Language (English / Hindi)

Every screen has an **EN / हिं** toggle (auth pages, app header, admin header).
The choice is saved per-device in `localStorage`. Translations live in
[`src/features/i18n/translations.ts`](src/features/i18n/translations.ts); Hindi
uses the Noto Sans Devanagari font. Server-side validation errors remain in
English.

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

Imports the roster in [`db/deedar-users.json`](db/deedar-users.json)
(name, mobile, role, head quarter, area) as **approved** users — role comes straight
from the source sheet's DESIGNATION column (SO or ISR). Each person's **initial
password is their own 10-digit mobile number**, and they are **forced to set a new
password on first login** (they can't reach the app until they do). Idempotent
(re-running updates name/role/head quarter/area, never resets passwords).

It also auto-assigns each **ISR to the SO in their head quarter** (only where that head
quarter has exactly one SO — never overwrites an existing assignment). Head quarters with
zero or multiple SOs are left for an admin to assign by hand in `/admin`.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

| Route      | Who        | Purpose                                             |
| ---------- | ---------- | --------------------------------------------------- |
| `/signup`  | anyone     | Request access (name, phone, role, head quarter, area, password) → pending |
| `/login`   | anyone     | Sign in with phone + password                       |
| `/`        | approved   | The tracker app (dashboard, add outlet, add visit)  |
| `/admin`   | admin only | Add users, edit users, and manage access            |

New signups are **pending** and cannot log in until an admin approves them at `/admin`.
Route protection is enforced in [`src/middleware.ts`](src/middleware.ts) and re-checked
in each page and API handler.

Users have a **role** — `ISR`, `SO`, or `admin`. ISR and SO both belong to a **Head
Quarter** (and optionally an **Area**); `admin` has no head quarter/area and gets the
admin dashboard/panel. Signup lets you pick any role; admin signups are still pending
until an existing admin approves them.

**Reporting line:** each ISR can be assigned to report to one SO (`reports_to_id` on the
user, editable in `/admin`'s Edit User form — a dropdown of existing SOs). This is purely
a recorded relationship right now; an SO's own dashboard is not a supervisor view (SOs see
the same screens as ISRs, minus Add Visit — see below).

**SO vs ISR permissions:** identical except **SOs cannot add visits** — the "Add Visit"
action is hidden from their dashboard and outlet-detail screen, and the visits API rejects
SO-role requests server-side as well (403).

From the `/admin` panel an admin can **add users** (name, phone, role, head quarter, area,
reports-to-SO for ISRs, optional temporary password — defaults to the phone number) and
**edit any user** — same fields, plus access status (pending / approved / rejected).
Admin-created users are approved immediately and, like imported reps, are **forced to set
a new password on first login**.

When a rep (SO/ISR) adds an outlet, its **Division field is prefilled with the rep's own
Head Quarter** (the outlet's own Division field is unrelated free text — it isn't renamed).

## Scripts

| Command               | Description                          |
| --------------------- | ------------------------------------ |
| `npm run dev`         | Start the dev server                 |
| `npm run build`       | Production build                     |
| `npm start`          | Run the production build             |
| `npm run lint`        | Lint                                 |
| `npm run db:setup`    | Apply the SQL schema                 |
| `npm run create-admin`| Create/refresh the admin account     |
| `npm run import-employees` | Import the Deedar sales team roster |

## Structure

See [ARCHITECTURE.md](./ARCHITECTURE.md). Feature code lives in `src/features/*`;
server/data/auth helpers in `src/lib/*`; API route handlers in `src/app/api/*`.
