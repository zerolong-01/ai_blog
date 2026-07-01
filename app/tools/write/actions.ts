"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { categories } from "@/data/categories";
import { createReviewFile } from "@/lib/reviews";
import { ToolCategory } from "@/lib/types";

export type ReviewFormState = {
  error: string | null;
};

const initialState: ReviewFormState = {
  error: null
};

function splitField(value: FormDataEntryValue | null) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function createReviewAction(
  previousState: ReviewFormState = initialState,
  formData: FormData
): Promise<ReviewFormState> {
  const category = String(formData.get("category") || "");

  if (!categories.some((item) => item.slug === category)) {
    return { error: "Please choose a valid category." };
  }

  const name = String(formData.get("name") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  const content = String(formData.get("content") || "").trim();

  if (!name || !summary || !content) {
    return { error: "Title, summary, and review content are required." };
  }

  try {
    const review = await createReviewFile({
      slug: String(formData.get("slug") || ""),
      name,
      tagline: String(formData.get("tagline") || "").trim(),
      category: category as ToolCategory,
      website: String(formData.get("website") || "").trim(),
      price: String(formData.get("price") || "").trim(),
      rating: Number(formData.get("rating") || 0),
      summary,
      verdict: String(formData.get("verdict") || "").trim(),
      bestFor: splitField(formData.get("bestFor")),
      pros: splitField(formData.get("pros")),
      cons: splitField(formData.get("cons")),
      features: splitField(formData.get("features")),
      content
    });

    revalidatePath("/tools");
    revalidatePath("/search");
    revalidatePath("/categories");
    revalidatePath(`/categories/${review.category}`);
    revalidatePath(`/tools/${review.slug}`);
    revalidatePath("/sitemap.xml");

    redirect(`/tools/${review.slug}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : previousState.error || "Failed to create the review."
    };
  }
}
