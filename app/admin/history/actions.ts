"use server";

import { requireAdminAuth } from "@/lib/admin-auth";
import { logAdminEvent } from "@/lib/admin-audit";
import { invalidatePublicPosts } from "@/lib/post-cache";
import { restorePostRevision } from "@/lib/posts-db";

export type RestoreRevisionState = { error: string | null; success?: boolean };

export async function restoreRevisionAction(_previous: RestoreRevisionState, data: FormData): Promise<RestoreRevisionState> {
  try {
    await requireAdminAuth();
    const id = String(data.get("revisionId") || "");
    if (!/^[1-9]\d{0,17}$/.test(id) || data.get("confirmation") !== id) return { error: "복원할 이력과 확인 항목을 선택해 주세요." };
    const slug = await restorePostRevision(id);
    invalidatePublicPosts(slug);
    await logAdminEvent("post_restored", { target: slug, outcome: "success" });
    return { error: null, success: true };
  } catch {
    return { error: "복원하지 못했습니다. 로그인·데이터베이스 상태를 확인해 주세요. 삭제 이력과 같은 주소의 글이 이미 있거나 수정 대상이 삭제된 경우 복원을 중단합니다." };
  }
}
