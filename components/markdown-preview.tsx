"use client";

import { useState } from "react";
import { renderMarkdown } from "@/lib/markdown";

export function MarkdownPreview({ content, disabled = false }: { content: string; disabled?: boolean }) {
  const [preview, setPreview] = useState<{ source: string; html: string } | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function showPreview() {
    setLoading(true);
    setError(false);
    try { setPreview({ source: content, html: await renderMarkdown(content) }); }
    catch { setError(true); }
    finally { setLoading(false); }
  }

  return (
    <section className="markdownPreview" aria-label="게시 전 미리보기">
      <div className="editorActions">
        <button type="button" className="secondaryButton" disabled={disabled || loading || !content.trim()} onClick={showPreview}>
          {loading ? "미리보기 생성 중…" : preview ? "미리보기 새로고침" : "Markdown 미리보기"}
        </button>
        {preview ? <button type="button" className="secondaryButton" disabled={disabled} onClick={() => setPreview(null)}>미리보기 닫기</button> : null}
      </div>
      {error ? <p role="alert">미리보기를 만들지 못했습니다. 다시 시도해 주세요.</p> : null}
      {preview && preview.source !== content ? <p role="status">본문이 변경되었습니다. 미리보기를 새로고침해 주세요.</p> : null}
      {preview ? <div className="postBody proseReview previewBody" dangerouslySetInnerHTML={{ __html: preview.html }} /> : null}
    </section>
  );
}
