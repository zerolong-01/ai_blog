import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getDatabaseSql } from "@/lib/database";

const COOKIE = "stacked_ai_admin";
const IDLE_MS = 24 * 60 * 60 * 1000;
const ABSOLUTE_MS = 7 * 24 * 60 * 60 * 1000;
type AdminEnvName = "ADMIN_ID_HASH" | "ADMIN_PASSWORD_SALT" | "ADMIN_PASSWORD_HASH";
const ENV_NAMES: AdminEnvName[] = ["ADMIN_ID_HASH", "ADMIN_PASSWORD_SALT", "ADMIN_PASSWORD_HASH"];

function env(name: AdminEnvName) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}
function safeEqualHex(left: string, right: string) {
  if (!/^[0-9a-f]+$/i.test(left) || !/^[0-9a-f]+$/i.test(right) || left.length !== right.length) return false;
  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}
function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
export function getAdminConfigError() {
  const missing = ENV_NAMES.filter((name) => !process.env[name]);
  return missing.length ? `Missing admin environment variables: ${missing.join(", ")}.` : null;
}
export function verifyAdminPassword(password: string) {
  if (getAdminConfigError()) return false;
  return safeEqualHex(scryptSync(password, env("ADMIN_PASSWORD_SALT"), 64).toString("hex"), env("ADMIN_PASSWORD_HASH"));
}
export function verifyAdminId(id: string) {
  if (getAdminConfigError()) return false;
  return safeEqualHex(createHash("sha256").update(id).digest("hex"), env("ADMIN_ID_HASH"));
}
export async function isAdminAuthenticated() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || token.length !== 64) return false;
  try {
    const sql = getDatabaseSql();
    const now = new Date();
    const idleCutoff = new Date(now.getTime() - IDLE_MS);
    const rows = await sql`
      UPDATE admin_sessions SET last_seen_at = ${now.toISOString()}::timestamptz
      WHERE token_hash = ${tokenHash(token)} AND expires_at > ${now.toISOString()}::timestamptz
        AND last_seen_at > ${idleCutoff.toISOString()}::timestamptz
      RETURNING token_hash
    `;
    return rows.length === 1;
  } catch {
    return false;
  }
}
export async function requireAdminAuth() {
  const error = getAdminConfigError();
  if (error) throw new Error(error);
  if (!(await isAdminAuthenticated())) throw new Error("Unauthorized");
}
export async function createAdminSession() {
  const token = randomBytes(32).toString("hex");
  const now = new Date();
  const expires = new Date(now.getTime() + ABSOLUTE_MS);
  const sql = getDatabaseSql();
  await sql`DELETE FROM admin_sessions WHERE expires_at <= NOW() OR last_seen_at <= NOW() - INTERVAL '24 hours'`;
  await sql`
    INSERT INTO admin_sessions (token_hash, created_at, last_seen_at, expires_at)
    VALUES (${tokenHash(token)}, ${now.toISOString()}::timestamptz, ${now.toISOString()}::timestamptz, ${expires.toISOString()}::timestamptz)
  `;
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, maxAge: ABSOLUTE_MS / 1000, sameSite: "strict",
    secure: process.env.NODE_ENV === "production", path: "/", priority: "high"
  });
}
export async function clearAdminSession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) {
    try {
      await getDatabaseSql()`DELETE FROM admin_sessions WHERE token_hash = ${tokenHash(token)}`;
    } catch {}
  }
  store.delete(COOKIE);
}
