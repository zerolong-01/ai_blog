"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminAuth } from "@/lib/admin-auth";
import { logAdminEvent } from "@/lib/admin-audit";
import { exceedsUtf8Bytes, INPUT_LIMITS } from "@/lib/input-validation";
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
  revalidatePath("/series");
  revalidatePath(`/tools/${slug}`);
  revalidatePath("/sitemap.xml");
}

function getSeriesFields(formData: FormData) {
  const seriesName = String(formData.get("seriesName") || "").trim();
  const rawSeriesOrder = String(formData.get("seriesOrder") || "").trim();

  if (!seriesName && !rawSeriesOrder) {
    return { seriesName: undefined, seriesOrder: undefined };
  }

  const seriesOrder = Number(rawSeriesOrder);

  if (
    !seriesName ||
    seriesName.length > INPUT_LIMITS.postSeriesName ||
    !Number.isInteger(seriesOrder) ||
    seriesOrder < 1 ||
    seriesOrder > INPUT_LIMITS.postSeriesOrder
  ) {
    throw new Error("Series name and a valid part number must be provided together.");
  }

  return { seriesName, seriesOrder };
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
  if (name.length > INPUT_LIMITS.postTitle || exceedsUtf8Bytes(content, INPUT_LIMITS.postContentBytes)) {
    return { error: "Title or content exceeds the allowed size." };
  }

  let slug: string;

  try {
    const series = getSeriesFields(formData);
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
      ...series,
      content
    });

    slug = review.slug;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : previousState.error || "Failed to create the review."
    };
  }

  revalidatePostPaths(slug);
  await logAdminEvent("post_created", { target: slug, outcome: "success" });

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
  if (
    slug.length > INPUT_LIMITS.postSlug ||
    name.length > INPUT_LIMITS.postTitle ||
    exceedsUtf8Bytes(content, INPUT_LIMITS.postContentBytes)
  ) {
    return { error: "Slug, title, or content exceeds the allowed size." };
  }

  let updatedSlug: string;

  try {
    const series = getSeriesFields(formData);
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
      ...series,
      content
    });

    updatedSlug = review.slug;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : previousState.error || "Failed to update the post."
    };
  }

  revalidatePostPaths(updatedSlug);
  await logAdminEvent("post_updated", { target: updatedSlug, outcome: "success" });
  redirect(`/tools/${updatedSlug}`);
}
