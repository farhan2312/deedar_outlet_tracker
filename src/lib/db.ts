import { Pool, type QueryResultRow } from "pg";

/**
 * Lazily-created singleton connection pool. Kept on globalThis so Next.js
 * hot-reloads in dev don't spawn a new pool on every change.
 */
const globalForDb = globalThis as unknown as { _deedarPool?: Pool };

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (see .env.example).",
    );
  }
  // Azure Postgres requires SSL. Skip SSL only for local databases.
  const isLocal = /@(localhost|127\.0\.0\.1)/.test(connectionString);
  return new Pool({
    connectionString,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
    max: 5,
  });
}

export function getPool(): Pool {
  if (!globalForDb._deedarPool) {
    globalForDb._deedarPool = createPool();
  }
  return globalForDb._deedarPool;
}

/** Run a parameterised query and return the rows. */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await getPool().query<T>(text, params);
  return result.rows;
}

/** Run a query expecting at most one row. */
export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
