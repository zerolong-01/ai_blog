import { neon } from "@neondatabase/serverless";

export function getDatabaseSql() {
  const value = process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim();
  if (!value) throw new Error("DATABASE_URL is not configured.");
  return neon(value);
}
