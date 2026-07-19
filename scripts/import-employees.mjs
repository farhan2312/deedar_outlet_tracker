// Imports the Rajasthan sales team into the users table.
// Run with:  npm run import-employees   (loads .env.local)
//
// Source roster: db/rajasthan-employees.json  ({ name, mobile, division }[])
// Each salesman is created as an APPROVED user (role: user) whose initial
// password is their own 10-digit mobile number. Idempotent: re-running updates
// name/division for existing phones without resetting passwords.
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
  readFileSync(join(__dirname, "..", "db", "rajasthan-employees.json"), "utf8"),
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
  for (const emp of roster) {
    const phone = String(emp.mobile || "").replace(/[^0-9]/g, "");
    if (phone.length !== 10 || !emp.name) {
      skipped++;
      continue;
    }
    const hash = await bcrypt.hash(phone, 10); // initial password = mobile number
    const res = await client.query(
      `insert into users (name, phone, password_hash, division, role, status)
         values ($1, $2, $3, $4, 'user', 'approved')
       on conflict (phone) do update set
         name = excluded.name,
         division = excluded.division
       returning (xmax = 0) as inserted`,
      [emp.name, phone, hash, emp.division],
    );
    if (res.rows[0]?.inserted) inserted++;
    else updated++;
  }
  console.log(
    `✓ Import complete — ${inserted} inserted, ${updated} updated, ${skipped} skipped.`,
  );
  console.log("  Each salesman's initial password is their 10-digit mobile number.");
} catch (err) {
  console.error("✗ Import failed:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
