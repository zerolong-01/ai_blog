import { neon } from "@neondatabase/serverless";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_FAILURES = 5;

type LoginAttempt = {
  failures: number;
  windowStartedAt: number;
};

type LoginAttemptRow = {
  failures: number | string;
  window_started_at: string;
};

const memoryAttempts = new Map<string, LoginAttempt>();
let tablePromise: Promise<void> | null = null;

function getConnectionString() {
  return process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim() || null;
}

async function getRateLimitSql() {
  const connectionString = getConnectionString();

  if (!connectionString) {
    return null;
  }

  const sql = neon(connectionString);

  if (!tablePromise) {
    tablePromise = Promise.resolve();
  }

  try {
    await tablePromise;
  } catch (error) {
    tablePromise = null;
    throw error;
  }

  return sql;
}

function reportRateLimitFallback(error: unknown) {
  console.warn("[admin-rate-limit]", {
    message: error instanceof Error ? error.message : String(error),
    mode: "instance-memory-fallback",
    timestamp: new Date().toISOString()
  });
}

function getMemoryAttempt(key: string, now = Date.now()) {
  const attempt = memoryAttempts.get(key);

  if (!attempt) {
    return null;
  }

  if (now - attempt.windowStartedAt >= LOGIN_WINDOW_MS) {
    memoryAttempts.delete(key);
    return null;
  }

  return attempt;
}

function toLimit(attempt: LoginAttempt | null, now = Date.now()) {
  if (!attempt || attempt.failures < MAX_LOGIN_FAILURES) {
    return { limited: false, retryAfterSeconds: 0 };
  }

  return {
    limited: true,
    retryAfterSeconds: Math.max(1, Math.ceil((LOGIN_WINDOW_MS - (now - attempt.windowStartedAt)) / 1000))
  };
}

function getMemoryLimit(key: string, now = Date.now()) {
  return toLimit(getMemoryAttempt(key, now), now);
}

function recordMemoryFailure(key: string, now = Date.now()) {
  const attempt = getMemoryAttempt(key, now);

  if (attempt) {
    attempt.failures += 1;
  } else {
    memoryAttempts.set(key, {
      failures: 1,
      windowStartedAt: now
    });
  }

  return getMemoryLimit(key, now);
}

export async function getAdminLoginLimit(key: string, now = Date.now()) {
  try {
    const sql = await getRateLimitSql();

    if (!sql) {
      return getMemoryLimit(key, now);
    }

    const cutoff = new Date(now - LOGIN_WINDOW_MS).toISOString();
    await sql`DELETE FROM admin_login_attempts WHERE window_started_at <= ${cutoff}::timestamptz`;
    const rows = (await sql`
      SELECT failures, window_started_at::text
      FROM admin_login_attempts
      WHERE client_key = ${key}
        AND window_started_at > ${cutoff}::timestamptz
      LIMIT 1
    `) as LoginAttemptRow[];
    const row = rows[0];

    return toLimit(
      row
        ? {
            failures: Number(row.failures),
            windowStartedAt: new Date(row.window_started_at).getTime()
          }
        : null,
      now
    );
  } catch (error) {
    reportRateLimitFallback(error);
    return getMemoryLimit(key, now);
  }
}

export async function recordAdminLoginFailure(key: string, now = Date.now()) {
  try {
    const sql = await getRateLimitSql();

    if (!sql) {
      return recordMemoryFailure(key, now);
    }

    const windowStartedAt = new Date(now).toISOString();
    const cutoff = new Date(now - LOGIN_WINDOW_MS).toISOString();
    const rows = (await sql`
      INSERT INTO admin_login_attempts (client_key, failures, window_started_at)
      VALUES (${key}, 1, ${windowStartedAt}::timestamptz)
      ON CONFLICT (client_key) DO UPDATE SET
        failures = CASE
          WHEN admin_login_attempts.window_started_at <= ${cutoff}::timestamptz THEN 1
          ELSE admin_login_attempts.failures + 1
        END,
        window_started_at = CASE
          WHEN admin_login_attempts.window_started_at <= ${cutoff}::timestamptz
            THEN ${windowStartedAt}::timestamptz
          ELSE admin_login_attempts.window_started_at
        END
      RETURNING failures, window_started_at::text
    `) as LoginAttemptRow[];
    const row = rows[0];

    return toLimit(
      row
        ? {
            failures: Number(row.failures),
            windowStartedAt: new Date(row.window_started_at).getTime()
          }
        : null,
      now
    );
  } catch (error) {
    reportRateLimitFallback(error);
    return recordMemoryFailure(key, now);
  }
}

export async function clearAdminLoginFailures(key: string) {
  memoryAttempts.delete(key);

  try {
    const sql = await getRateLimitSql();

    if (sql) {
      await sql`DELETE FROM admin_login_attempts WHERE client_key = ${key}`;
    }
  } catch (error) {
    reportRateLimitFallback(error);
  }
}
