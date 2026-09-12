"use server";

import { revalidatePath } from "next/cache";

import { requireAdminAuth } from "@/lib/admin-auth";
import { logAdminEvent } from "@/lib/admin-audit";
import { createGeneratingDraft, findReusableDraft, saveFailedDraft, saveReadyDraft } from "@/lib/news-drafts";
import { fetchNewsSource, NewsSourceError, validatePublicNewsUrl } from "@/lib/news-source";
import { generateArticle } from "@/lib/openai-article";
import { getAllReviewMeta } from "@/lib/reviews";
import { buildSeriesContext } from "@/lib/series-assignment";

export type GenerateNewsDraftResult =
  | { ok: true; draftId: string }
  | { ok: false; code: "INVALID_URL" | "FETCH_FAILED" | "EXTRACTION_FAILED" | "AI_FAILED"; message: string };

export const initialNewsDraftState: GenerateNewsDraftResult = {
  ok: false,
  code: "INVALID_URL",
  message: ""
};

export async function generateNewsDraftAction(
  previousState: GenerateNewsDraftResult = initialNewsDraftState,
  formData: FormData
): Promise<GenerateNewsDraftResult> {
  void previousState;
  await requireAdminAuth();
  const rawUrl = String(formData.get("sourceUrl") || "").trim();
  const pastedText = String(formData.get("sourceText") || "").trim();
  let sourceUrl: URL;
  try {
    sourceUrl = await validatePublicNewsUrl(rawUrl);
  } catch (error) {
    const sourceError = error instanceof NewsSourceError ? error : undefined;
    return { ok: false, code: sourceError?.code || "INVALID_URL", message: sourceError?.message || "Enter a valid news URL." };
  }

  const canonicalUrl = sourceUrl.toString();
  const reusable = await findReusableDraft(canonicalUrl);
  if (reusable) return { ok: true, draftId: reusable.id };

  const draftId = await createGeneratingDraft(canonicalUrl);
  try {
    const source = pastedText
      ? { url: canonicalUrl, title: "", publisher: sourceUrl.hostname.replace(/^www\./, ""), text: pastedText.slice(0, 100_000) }
      : await fetchNewsSource(canonicalUrl);
    if (source.text.length < 500) throw new NewsSourceError("EXTRACTION_FAILED", "Paste at least 500 characters of article text.");
    const existingSeries = buildSeriesContext(await getAllReviewMeta());
    const article = await generateArticle(source, existingSeries);
    await saveReadyDraft(draftId, source, article);
    await logAdminEvent("news_draft_generated", { target: draftId, outcome: "success" });
    revalidatePath(`/tools/write/from-news/${draftId}`);
    return { ok: true, draftId };
  } catch (error) {
    const sourceError = error instanceof NewsSourceError ? error : undefined;
    const code = sourceError?.code || "AI_FAILED";
    const publicMessage = sourceError?.message || "The AI draft could not be generated. Check the API configuration and try again.";
    await saveFailedDraft(draftId, publicMessage);
    await logAdminEvent("news_draft_generated", { target: draftId, outcome: "failure" });
    console.error("[news-draft]", { draftId, message: error instanceof Error ? error.message : String(error) });
    return { ok: false, code, message: publicMessage };
  }
}
