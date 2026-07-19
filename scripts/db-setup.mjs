// Applies db/schema.sql to DATABASE_URL.
// Run with:  npm run db:setup   (loads .env.local)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Add it to .env.local.");
  process.exit(1);
}

const isLocal = /@(localhost|127\.0\.0\.1)/.test(connectionString);
const client = new pg.Client({
  connectionString,
  ssl: isLocal ? undefined : { rejectUnauthorized: false },
});

const sql = readFileSync(join(__dirname, "..", "db", "schema.sql"), "utf8");

try {
  await client.connect();
  await client.query(sql);
  console.log("✓ Schema applied successfully.");
} catch (err) {
  console.error("✗ Failed to apply schema:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
