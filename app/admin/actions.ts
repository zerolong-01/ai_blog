"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "node:crypto";

import { clearAdminSession, createAdminSession, requireAdminAuth, verifyAdminId, verifyAdminPassword } from "@/lib/admin-auth";
import { logAdminEvent } from "@/lib/admin-audit";
import {
  clearAdminLoginFailures,
  getAdminLoginLimit,
  recordAdminLoginFailure
} from "@/lib/admin-rate-limit";
import { INPUT_LIMITS } from "@/lib/input-validation";
import { deleteReviewFile } from "@/lib/reviews";

export type AdminAuthState = {
  error: string | null;
};

const initialState: AdminAuthState = {
  error: null
};

async function getRequestIdentity() {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwardedFor || requestHeaders.get("x-real-ip")?.trim() || "unknown";
  const addressHash = createHash("sha256").update(address).digest("hex");

  return {
    rateLimitKey: addressHash,
    fingerprint: addressHash.slice(0, 12)
  };
}

export async function loginAdminAction(
  previousState: AdminAuthState = initialState,
  formData: FormData
): Promise<AdminAuthState> {
  void previousState;
  const id = String(formData.get("id") || "").trim();
  const password = String(formData.get("password") || "");
  if (id.length > INPUT_LIMITS.adminId || password.length > INPUT_LIMITS.adminPassword) {
    return { error: "Incorrect admin id or password." };
  }
  const requestIdentity = await getRequestIdentity();
  const accountKey = createHash("sha256").update(`account:${id.toLowerCase()}`).digest("hex");
  const limits = await Promise.all([
    getAdminLoginLimit(requestIdentity.rateLimitKey),
    getAdminLoginLimit(accountKey)
  ]);
  const limit = limits.find((item) => item.limited) || limits[0];

  if (limit.limited) {
    await logAdminEvent("login_rate_limited", {
      client: requestIdentity.fingerprint,
      outcome: "blocked"
    });
    return { error: `Too many sign-in attempts. Try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minute(s).` };
  }

  // Always perform both checks to avoid exposing whether the ID or password was correct through timing.
  const idMatches = verifyAdminId(id);
  const passwordMatches = verifyAdminPassword(password);

  if (!idMatches || !passwordMatches) {
    const [updatedLimit] = await Promise.all([
      recordAdminLoginFailure(requestIdentity.rateLimitKey),
      recordAdminLoginFailure(accountKey)
    ]);
    await logAdminEvent("login_failed", {
      client: requestIdentity.fingerprint,
      outcome: updatedLimit.limited ? "blocked" : "failure"
    });
    return { error: "Incorrect admin id or password." };
  }

  await Promise.all([clearAdminLoginFailures(requestIdentity.rateLimitKey), clearAdminLoginFailures(accountKey)]);
  await logAdminEvent("login_succeeded", { client: requestIdentity.fingerprint, outcome: "success" });
  await createAdminSession();
  redirect("/admin");
}

export async function logoutAdminAction() {
  await clearAdminSession();
  redirect("/admin");
}

export async function deletePostAction(formData: FormData) {
  const slug = String(formData.get("slug") || "").trim();
  const confirmation = String(formData.get("confirmation") || "").trim();

  if (!slug) {
    throw new Error("Missing slug.");
  }

  await requireAdminAuth();

  if (confirmation !== slug) {
    throw new Error("Post deletion was not confirmed.");
  }

  await deleteReviewFile(slug);
  await logAdminEvent("post_deleted", { target: slug, outcome: "success" });

  revalidatePath("/admin");
  revalidatePath("/tools");
  revalidatePath("/search");
  revalidatePath("/categories");
  revalidatePath(`/tools/${slug}`);
  revalidatePath("/sitemap.xml");
}
