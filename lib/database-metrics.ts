import { getDatabaseSql } from "@/lib/database";

export async function getDatabaseMetrics() {
  const rows = await getDatabaseSql()`
    SELECT COALESCE(SUM(pg_total_relation_size(c.oid)), 0)::text AS bytes
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'm')
  `;
  const bytes = Number(rows[0]?.bytes || 0);
  const limitMb = Number(process.env.DATABASE_STORAGE_LIMIT_MB);
  const limitBytes = Number.isFinite(limitMb) && limitMb > 0 ? limitMb * 1024 * 1024 : null;
  return { bytes, limitBytes, percent: limitBytes ? bytes / limitBytes * 100 : null };
}
