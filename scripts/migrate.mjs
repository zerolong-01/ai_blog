import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

const connection = process.env.MIGRATION_DATABASE_URL?.trim();
if (!connection) throw new Error("MIGRATION_DATABASE_URL is required.");
const sql = neon(connection);
const directory = path.join(process.cwd(), "migrations");
const files = (await readdir(directory)).filter((file) => file.endsWith(".sql")).sort();
await sql`CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
for (const file of files) {
  if ((await sql`SELECT 1 FROM schema_migrations WHERE name = ${file}`).length) continue;
  const statements = (await readFile(path.join(directory, file), "utf8"))
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
  for (const statement of statements) await sql.query(statement);
  await sql`INSERT INTO schema_migrations (name) VALUES (${file})`;
  console.log(`Applied ${file}`);
}
