import type { DraftStatus } from "@/lib/editor-draft-store";

export function EditorDraftStatus({ status, clearDraft, disabled = false }: { status: DraftStatus; clearDraft: () => void; disabled?: boolean }) {
  return (
    <div className="editorHint">
      <p role="status" aria-live="polite">
        {status === "restored" ? "이 브라우저에 저장된 초안을 복원했습니다." :
          status === "saved" ? "초안이 이 브라우저에 자동 저장되었습니다." :
          status === "unavailable" ? "브라우저 임시저장을 사용할 수 없습니다. 새로고침 전에 내용을 따로 복사해 주세요." :
          "작성 내용은 이 브라우저에 자동 저장되며, 새로고침·재로그인 후 복원됩니다."}
      </p>
      <p>게시·수정 성공 시 초안이 삭제됩니다. 이 기기를 함께 사용하는 경우 작성을 마친 뒤 초안을 지워 주세요.</p>
      {status === "saved" || status === "restored" ? (
        <button type="button" className="secondaryButton" disabled={disabled} onClick={() => {
          if (window.confirm("저장된 초안과 현재 입력을 지우고 처음 상태로 돌아갈까요?")) clearDraft();
        }}>초안 삭제</button>
      ) : null}
    </div>
  );
}
