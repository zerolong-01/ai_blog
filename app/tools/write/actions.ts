"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminAuth } from "@/lib/admin-auth";
import { createReviewFile } from "@/lib/reviews";

export type ReviewFormState = {
  error: string | null;
};

const initialState: ReviewFormState = {
  error: null
};

export async function createReviewAction(
  previousState: ReviewFormState = initialState,
  formData: FormData
): Promise<ReviewFormState> {
  await requireAdminAuth();

  const name = String(formData.get("name") || "").trim();
  const content = String(formData.get("content") || "").trim();

  if (!name || !content) {
    return { error: "Title and content are required." };
  }

  const summary =
    content
      .replace(/^#+\s+/gm, "")
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .find(Boolean)
      ?.slice(0, 180) || "";

  let slug: string;

  try {
    const review = await createReviewFile({
      slug: String(formData.get("slug") || ""),
      name,
      tagline: "",
      category: "general",
      website: "",
      price: "",
      rating: 0,
      summary,
      verdict: "",
      bestFor: [],
      pros: [],
      cons: [],
      features: [],
      content
    });

    slug = review.slug;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : previousState.error || "Failed to create the review."
    };
  }

  revalidatePath("/tools");
  revalidatePath("/search");
  revalidatePath("/categories");
  revalidatePath(`/tools/${slug}`);
  revalidatePath("/sitemap.xml");

  redirect(`/tools/${slug}`);
}
