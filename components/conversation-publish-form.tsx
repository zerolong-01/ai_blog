"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { MarkdownPreview } from "@/components/markdown-preview";
import { EditorDraftStatus } from "@/components/editor-draft-status";
import { useEditorDraft } from "@/components/use-editor-draft";
import { publishConversationAction, type ConversationPublishState } from "@/app/tools/write/from-conversation/actions";

export function ConversationPublishForm() {
  const router = useRouter();
  const { values, setValues, status, clearDraft } = useEditorDraft("conversation", { title: "", sourceText: "" });
  const [state, action, pending] = useActionState(async (previous: ConversationPublishState, data: FormData) => {
    const result = await publishConversationAction(previous, data);
    if (result.redirectTo) {
      clearDraft();
      router.push(result.redirectTo);
      router.refresh();
    }
    return result;
  }, { error: null });
  return (
    <form action={action} className="editorForm newsImportForm">
      <label className="fieldGroup">
        <span>글 제목</span>
        <input name="title" required maxLength={200} placeholder="예: 오늘의 AI 소식 — 2026년 9월 18일" readOnly={pending} value={values.title} onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))} />
      </label>
      <label className="fieldGroup">
        <span>매일 업데이트된 대화 내용</span>
        <textarea name="sourceText" required minLength={100} maxLength={100_000} rows={18} placeholder="ChatGPT 대화에서 오늘 게시할 업데이트 내용을 복사해 붙여넣으세요. 날짜와 참고 링크도 함께 넣으면 좋습니다." readOnly={pending} value={values.sourceText} onChange={(event) => setValues((current) => ({ ...current, sourceText: event.target.value }))} />
      </label>
      <p className="editorHint">붙여넣은 본문을 그대로 공개 게시합니다. Markdown 제목, 목록, 링크를 사용할 수 있습니다. AI API를 사용하지 않습니다.</p>
      <MarkdownPreview content={values.sourceText} disabled={pending} />
        <EditorDraftStatus status={status} clearDraft={clearDraft} disabled={pending} />
      {state.error ? <p className="formError" role="alert">{state.error}</p> : null}
      <p role="status" aria-live="polite">{pending ? "블로그에 게시하고 있습니다. 잠시 기다려 주세요…" : ""}</p>
      <div className="editorActions"><button type="submit" className="primaryButton" disabled={pending}>{pending ? "게시 중…" : "바로 게시"}</button></div>
    </form>
  );
}
