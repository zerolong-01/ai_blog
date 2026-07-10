"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminAuth } from "@/lib/admin-auth";
import { createReviewFile, updateReviewFile } from "@/lib/reviews";

export type ReviewFormState = {
  error: string | null;
};

const initialState: ReviewFormState = {
  error: null
};

function getSummary(content: string) {
  return (
    content
      .replace(/^#+\s+/gm, "")
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .find(Boolean)
      ?.slice(0, 180) || ""
  );
}

function revalidatePostPaths(slug: string) {
  revalidatePath("/admin");
  revalidatePath("/tools");
  revalidatePath("/search");
  revalidatePath("/categories");
  revalidatePath(`/tools/${slug}`);
  revalidatePath("/sitemap.xml");
}

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
      summary: getSummary(content),
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

  revalidatePostPaths(slug);

  redirect(`/tools/${slug}`);
}

export async function updateReviewAction(
  previousState: ReviewFormState = initialState,
  formData: FormData
): Promise<ReviewFormState> {
  await requireAdminAuth();

  const slug = String(formData.get("slug") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const content = String(formData.get("content") || "").trim();

  if (!slug || !name || !content) {
    return { error: "Slug, title, and content are required." };
  }

  try {
    const review = await updateReviewFile({
      slug,
      name,
      tagline: "",
      category: "general",
      website: "",
      price: "",
      rating: 0,
      summary: getSummary(content),
      verdict: "",
      bestFor: [],
      pros: [],
      cons: [],
      features: [],
      content
    });

    revalidatePostPaths(review.slug);
    redirect(`/tools/${review.slug}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : previousState.error || "Failed to update the post."
    };
  }
}
