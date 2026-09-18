"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { restoreRevisionAction } from "@/app/admin/history/actions";

export function RestoreRevisionForm({ id }: { id: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(async (previous: { error: string | null; success?: boolean }, data: FormData) => {
    const result = await restoreRevisionAction(previous, data);
    if (result.success) router.refresh();
    return result;
  }, { error: null });
  return <form action={action} className="editorForm">
    <input type="hidden" name="revisionId" value={id} />
    <label><input type="checkbox" name="confirmation" value={id} required disabled={pending} /> 이 내용으로 복원합니다. 현재 글이 있다면 복원 전 내용도 이력에 보관됩니다.</label>
    <button type="submit" className="primaryButton" disabled={pending || state.success}>{pending ? "복원 중…" : state.success ? "복원 완료" : "이 버전 복원"}</button>
    {state.error ? <p role="alert">{state.error}</p> : null}
    {state.success ? <p role="status">글을 복원했습니다.</p> : null}
  </form>;
}
