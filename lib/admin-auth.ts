import { createHash, createHmac, scryptSync, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "stacked_ai_admin";
const ADMIN_COOKIE_PAYLOAD = "authorized";
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

type AdminEnvName = "ADMIN_ID_HASH" | "ADMIN_PASSWORD_SALT" | "ADMIN_PASSWORD_HASH" | "ADMIN_SESSION_SECRET";

const ADMIN_ENV_NAMES: AdminEnvName[] = [
  "ADMIN_ID_HASH",
  "ADMIN_PASSWORD_SALT",
  "ADMIN_PASSWORD_HASH",
  "ADMIN_SESSION_SECRET"
];

function getEnv(name: AdminEnvName) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

function isValidHex(value: string) {
  return value.length > 0 && value.length % 2 === 0 && /^[0-9a-f]+$/i.test(value);
}

export function getAdminConfigError() {
  const missing = ADMIN_ENV_NAMES.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    return `Missing admin environment variables: ${missing.join(", ")}.`;
  }

  return null;
}

function safeEqualHex(left: string, right: string) {
  if (!isValidHex(left) || !isValidHex(right)) {
    return false;
  }

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
  if (getAdminConfigError()) {
    return false;
  }

  const salt = getEnv("ADMIN_PASSWORD_SALT");
  const expectedHash = getEnv("ADMIN_PASSWORD_HASH");
  const derivedHash = scryptSync(password, salt, 64).toString("hex");

  return safeEqualHex(derivedHash, expectedHash);
}

export function verifyAdminId(id: string) {
  if (getAdminConfigError()) {
    return false;
  }

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

  try {
    return safeEqualHex(session, signAdminPayload());
  } catch {
    return false;
  }
}

export async function requireAdminAuth() {
  const configError = getAdminConfigError();

  if (configError) {
    throw new Error(configError);
  }

  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    throw new Error("Unauthorized");
  }
}

export async function createAdminSession() {
  const configError = getAdminConfigError();

  if (configError) {
    throw new Error(configError);
  }

  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, signAdminPayload(), {
    httpOnly: true,
    maxAge: ADMIN_SESSION_MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
