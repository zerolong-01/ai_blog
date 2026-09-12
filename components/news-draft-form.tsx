"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";
import { FormEvent, useState } from "react";

import type { GenerateNewsDraftResult } from "@/lib/generate-news-draft";

export function NewsDraftForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setRequestId("");
    try {
      const response = await fetch("/api/news-drafts", { method: "POST", body: new FormData(event.currentTarget) });
      const result = await response.json() as GenerateNewsDraftResult & { requestId?: string };
      if (result.ok) {
        router.push(`/tools/write/from-news/${result.draftId}` as Route);
        return;
      }
      setError(result.message);
      setRequestId(result.requestId || "");
      if (response.status === 401) router.refresh();
    } catch {
      setError("The server did not return a valid response. Please retry.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="editorForm newsImportForm">
      <label className="fieldGroup">
        <span>Primary news URL</span>
        <input name="sourceUrl" type="url" required placeholder="https://example.com/news/article" autoComplete="url" />
      </label>
      <label className="fieldGroup">
        <span>Article text (optional fallback)</span>
        <textarea name="sourceText" rows={10} maxLength={100_000} placeholder="If the source has a paywall or blocks automated access, paste the article text here." />
      </label>
      {error ? <p className="formError" role="alert">{error}{requestId ? <><br /><code>Reference: {requestId}</code></> : null}</p> : null}
      <p className="editorHint">The source is treated as untrusted material. A draft is saved for review and is never published automatically.</p>
      <div className="editorActions"><button type="submit" className="primaryButton" disabled={pending}>{pending ? "Reading and analyzing…" : "Generate draft"}</button></div>
    </form>
  );
}
