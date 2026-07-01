"use server";

import { revalidatePath } from "next/cache";

import { deleteReviewFile } from "@/lib/reviews";

export async function deletePostAction(formData: FormData) {
  const slug = String(formData.get("slug") || "").trim();

  if (!slug) {
    throw new Error("Missing slug.");
  }

  await deleteReviewFile(slug);

  revalidatePath("/admin");
  revalidatePath("/tools");
  revalidatePath("/search");
  revalidatePath("/categories");
  revalidatePath(`/tools/${slug}`);
  revalidatePath("/sitemap.xml");
}
