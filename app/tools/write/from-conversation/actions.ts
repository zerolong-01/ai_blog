"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAuth } from "@/lib/admin-auth";
import { logAdminEvent } from "@/lib/admin-audit";
import { exceedsUtf8Bytes, INPUT_LIMITS } from "@/lib/input-validation";
import { createReviewFile } from "@/lib/reviews";

export async function publishConversationAction(_previous: { error: string | null }, formData: FormData): Promise<{ error: string | null }> {
  try {
    await requireAdminAuth();
  } catch {
    return { error: "관리자 로그인이 필요합니다. 다시 로그인해 주세요." };
  }
  const text = String(formData.get("sourceText") || "").trim();
  const title = String(formData.get("title") || "").trim();
  if (!title || title.length > INPUT_LIMITS.postTitle) return { error: "제목을 1~200자 사이로 입력해 주세요." };
  if (text.length < 100) return { error: "업데이트 내용을 100자 이상 붙여넣어 주세요." };
  if (text.length > 100_000 || exceedsUtf8Bytes(text, INPUT_LIMITS.postContentBytes)) {
    return { error: "입력 내용이 너무 깁니다. 100,000자 및 200KB 이하로 줄여 주세요." };
  }
  let slug: string;
  try {
    const review = await createReviewFile({
      // Explicit slug also supports articles whose title contains only Korean characters.
      slug: `conversation-${crypto.randomUUID()}`,
      name: title, summary: text.replace(/^#+\s+/gm, "").replace(/\s+/g, " ").slice(0, 180), content: text,
      tagline: "", category: "general", website: "", price: "", rating: 0,
      verdict: "", bestFor: [], pros: [], cons: [], features: []
    });
    slug = review.slug;
  } catch (error) {
    console.error("[conversation-publish]", { message: error instanceof Error ? error.message : String(error) });
    return { error: "글 저장에 실패했습니다. 데이터베이스 설정을 확인하고 다시 시도해 주세요." };
  }
  for (const path of ["/", "/admin", "/tools", "/search", "/categories", "/series", "/sitemap.xml", "/rss.xml", `/tools/${slug}`]) revalidatePath(path);
  await logAdminEvent("conversation_published", { target: slug, outcome: "success" });
  redirect(`/tools/${slug}`);
}
