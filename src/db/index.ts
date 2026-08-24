import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

declare global {
  var _pgPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and configure it.");
}

const pool =
  global._pgPool ??
  new Pool({
    connectionString,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  global._pgPool = pool;
}

export const db = drizzle(pool, { schema });
export type Database = typeof db;
