"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "node:crypto";

import { clearAdminSession, createAdminSession, requireAdminAuth, verifyAdminId, verifyAdminPassword } from "@/lib/admin-auth";
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

function logAdminEvent(event: string, details: Record<string, string | number>) {
  console.info("[admin-audit]", {
    event,
    ...details,
    timestamp: new Date().toISOString()
  });
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
  const limit = await getAdminLoginLimit(requestIdentity.rateLimitKey);

  if (limit.limited) {
    logAdminEvent("login_rate_limited", {
      client: requestIdentity.fingerprint,
      retryAfterSeconds: limit.retryAfterSeconds
    });
    return { error: `Too many sign-in attempts. Try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minute(s).` };
  }

  // Always perform both checks to avoid exposing whether the ID or password was correct through timing.
  const idMatches = verifyAdminId(id);
  const passwordMatches = verifyAdminPassword(password);

  if (!idMatches || !passwordMatches) {
    const updatedLimit = await recordAdminLoginFailure(requestIdentity.rateLimitKey);
    logAdminEvent("login_failed", {
      client: requestIdentity.fingerprint,
      limited: updatedLimit.limited ? 1 : 0
    });
    return { error: "Incorrect admin id or password." };
  }

  await clearAdminLoginFailures(requestIdentity.rateLimitKey);
  logAdminEvent("login_succeeded", { client: requestIdentity.fingerprint });
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
  logAdminEvent("post_deleted", { slug });

  revalidatePath("/admin");
  revalidatePath("/tools");
  revalidatePath("/search");
  revalidatePath("/categories");
  revalidatePath(`/tools/${slug}`);
  revalidatePath("/sitemap.xml");
}
