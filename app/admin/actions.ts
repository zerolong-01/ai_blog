"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { clearAdminSession, createAdminSession, requireAdminAuth, verifyAdminPassword } from "@/lib/admin-auth";
import { deleteReviewFile } from "@/lib/reviews";

export type AdminAuthState = {
  error: string | null;
};

const initialState: AdminAuthState = {
  error: null
};

export async function loginAdminAction(
  previousState: AdminAuthState = initialState,
  formData: FormData
): Promise<AdminAuthState> {
  void previousState;
  const password = String(formData.get("password") || "");

  if (!verifyAdminPassword(password)) {
    return { error: "Incorrect password." };
  }

  await createAdminSession();
  redirect("/admin");
}

export async function logoutAdminAction() {
  await clearAdminSession();
  redirect("/admin");
}

export async function deletePostAction(formData: FormData) {
  const slug = String(formData.get("slug") || "").trim();

  if (!slug) {
    throw new Error("Missing slug.");
  }

  await requireAdminAuth();
  await deleteReviewFile(slug);

  revalidatePath("/admin");
  revalidatePath("/tools");
  revalidatePath("/search");
  revalidatePath("/categories");
  revalidatePath(`/tools/${slug}`);
  revalidatePath("/sitemap.xml");
}
