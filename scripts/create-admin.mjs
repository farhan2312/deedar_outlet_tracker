// Creates (or updates) the first admin account from env vars.
// Run with:  npm run create-admin   (loads .env.local)
//
// Reads ADMIN_NAME, ADMIN_PHONE, ADMIN_PASSWORD. Idempotent: if the phone
// already exists it is promoted to an approved admin with a fresh password.
import pg from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Add it to .env.local.");
  process.exit(1);
}

const name = (process.env.ADMIN_NAME || "Admin").trim();
const phone = (process.env.ADMIN_PHONE || "").replace(/[^0-9]/g, "").slice(0, 10);
const password = process.env.ADMIN_PASSWORD || "";

if (phone.length !== 10) {
  console.error("ADMIN_PHONE must be a 10-digit number.");
  process.exit(1);
}
if (password.length < 6) {
  console.error("ADMIN_PASSWORD must be at least 6 characters.");
  process.exit(1);
}

const isLocal = /@(localhost|127\.0\.0\.1)/.test(connectionString);
const client = new pg.Client({
  connectionString,
  ssl: isLocal ? undefined : { rejectUnauthorized: false },
});

const hash = await bcrypt.hash(password, 10);

try {
  await client.connect();
  await client.query(
    `insert into users (name, phone, password_hash, role, status)
       values ($1, $2, $3, 'admin', 'approved')
     on conflict (phone) do update set
       name = excluded.name,
       password_hash = excluded.password_hash,
       role = 'admin',
       status = 'approved'`,
    [name, phone, hash],
  );
  console.log(`✓ Admin ready: ${name} (${phone})`);
} catch (err) {
  console.error("✗ Failed to create admin:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
