import { neon } from "@neondatabase/serverless";

export function evaluateStorage(bytes, limitMb, warningPercent = 80) {
  if (!Number.isFinite(bytes) || bytes < 0 || !Number.isFinite(limitMb) || limitMb <= 0 || !Number.isFinite(warningPercent) || warningPercent <= 0 || warningPercent > 100) {
    throw new Error("유효한 사용량·DATABASE_STORAGE_LIMIT_MB·STORAGE_WARNING_PERCENT 설정이 필요합니다.");
  }
  const percent = bytes / (limitMb * 1024 * 1024) * 100;
  return { bytes, percent, warning: percent >= warningPercent };
}

export async function monitor({ sql, fetchHealth, limitMb, warningPercent = 80 }) {
  const response = await fetchHealth();
  if (!response.ok) throw new Error("블로그 health API가 정상 상태를 반환하지 않았습니다.");
  const health = await response.json();
  if (health.status !== "ok" || health.storage !== "database") throw new Error("블로그 DB 연결이 정상 상태가 아닙니다.");
  const rows = await sql`
    SELECT COALESCE(SUM(pg_total_relation_size(c.oid)), 0)::text AS bytes
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'm')
  `;
  return evaluateStorage(Number(rows[0]?.bytes), limitMb, warningPercent);
}

if (import.meta.url === new URL(process.argv[1], "file:").href) {
  try {
    const connection = process.env.MONITOR_DATABASE_URL?.trim();
    if (!connection) throw new Error("MONITOR_DATABASE_URL 설정이 필요합니다.");
    const healthUrl = new URL("/api/health", process.env.BLOG_URL);
    if (healthUrl.protocol !== "https:") throw new Error("BLOG_URL은 HTTPS 주소여야 합니다.");
    const result = await monitor({
      sql: neon(connection),
      fetchHealth: () => fetch(healthUrl, { signal: AbortSignal.timeout(15000), redirect: "error" }),
      limitMb: Number(process.env.DATABASE_STORAGE_LIMIT_MB),
      warningPercent: Number(process.env.STORAGE_WARNING_PERCENT || 80)
    });
    console.log(`DB 연결 정상 · 테이블·인덱스 ${(result.bytes / 1024 / 1024).toFixed(2)} MB · 설정 한도의 ${result.percent.toFixed(1)}%`);
    if (result.warning) throw new Error("데이터베이스 용량 경고 기준을 초과했습니다.");
  } catch {
    console.error("블로그 장애·용량 점검 실패: health API, DB 연결, 설정 값 또는 용량 경고 기준을 확인해 주세요.");
    process.exitCode = 1;
  }
}
