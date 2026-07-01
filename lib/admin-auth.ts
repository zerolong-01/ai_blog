import { createHash, createHmac, scryptSync, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "stacked_ai_admin";
const ADMIN_COOKIE_PAYLOAD = "authorized";

function getEnv(name: "ADMIN_ID_HASH" | "ADMIN_PASSWORD_SALT" | "ADMIN_PASSWORD_HASH" | "ADMIN_SESSION_SECRET") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

function safeEqualHex(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function signAdminPayload() {
  const secret = getEnv("ADMIN_SESSION_SECRET");

  return createHmac("sha256", secret).update(ADMIN_COOKIE_PAYLOAD).digest("hex");
}

export function verifyAdminPassword(password: string) {
  const salt = getEnv("ADMIN_PASSWORD_SALT");
  const expectedHash = getEnv("ADMIN_PASSWORD_HASH");
  const derivedHash = scryptSync(password, salt, 64).toString("hex");

  return safeEqualHex(derivedHash, expectedHash);
}

export function verifyAdminId(id: string) {
  const expectedHash = getEnv("ADMIN_ID_HASH");
  const derivedHash = createHash("sha256").update(id).digest("hex");

  return safeEqualHex(derivedHash, expectedHash);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!session) {
    return false;
  }

  return safeEqualHex(session, signAdminPayload());
}

export async function requireAdminAuth() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    throw new Error("Unauthorized");
  }
}

export async function createAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, signAdminPayload(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
