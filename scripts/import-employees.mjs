// Imports the Deedar sales team into the users table.
// Run with:  npm run import-employees   (loads .env.local)
//
// Source roster: db/deedar-users.json  ({ name, mobile, role, headQuarter, area }[])
// `role` comes straight from the roster's DESIGNATION column (SO or ISR).
// Each person is created as an APPROVED user whose initial password is their
// own 10-digit mobile number. Idempotent: re-running updates
// name/role/headQuarter/area for existing phones without resetting passwords.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";
import bcrypt from "bcryptjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Add it to .env.local.");
  process.exit(1);
}

const roster = JSON.parse(
  readFileSync(join(__dirname, "..", "db", "deedar-users.json"), "utf8"),
);

const isLocal = /@(localhost|127\.0\.0\.1)/.test(connectionString);
const client = new pg.Client({
  connectionString,
  ssl: isLocal ? undefined : { rejectUnauthorized: false },
});

let inserted = 0;
let updated = 0;
let skipped = 0;

try {
  await client.connect();
  for (const person of roster) {
    const phone = String(person.mobile || "").replace(/[^0-9]/g, "");
    const role = person.role === "SO" ? "SO" : "ISR";
    if (phone.length !== 10 || !person.name) {
      skipped++;
      continue;
    }
    const hash = await bcrypt.hash(phone, 10); // initial password = mobile number
    const res = await client.query(
      `insert into users (name, phone, password_hash, head_quarter, area, role, status, must_change_password)
         values ($1, $2, $3, $4, $5, $6, 'approved', true)
       on conflict (phone) do update set
         name = excluded.name,
         head_quarter = excluded.head_quarter,
         area = excluded.area,
         role = excluded.role
       returning (xmax = 0) as inserted`,
      [person.name, phone, hash, person.headQuarter, person.area, role],
    );
    if (res.rows[0]?.inserted) inserted++;
    else updated++;
  }
  console.log(
    `✓ Import complete — ${inserted} inserted, ${updated} updated, ${skipped} skipped.`,
  );
  console.log("  Each person's initial password is their 10-digit mobile number.");
} catch (err) {
  console.error("✗ Import failed:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
