import { getDatabaseSql } from "@/lib/database";

export async function logAdminEvent(
  event: string,
  details: { client?: string; target?: string; outcome: "success" | "failure" | "blocked" }
) {
  console.info("[admin-audit]", { event, ...details, timestamp: new Date().toISOString() });
  try {
    const sql = getDatabaseSql();
    await sql`DELETE FROM admin_audit_events WHERE created_at < NOW() - INTERVAL '90 days'`;
    await sql`
      INSERT INTO admin_audit_events (event, client_key, target, outcome)
      VALUES (${event}, ${details.client || null}, ${details.target || null}, ${details.outcome})
    `;
  } catch (error) {
    console.warn("[admin-audit-fallback]", error instanceof Error ? error.message : String(error));
  }
}
