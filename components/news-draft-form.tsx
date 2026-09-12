"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";

import { generateNewsDraftAction, initialNewsDraftState } from "@/app/tools/write/from-news/actions";

function GenerateButton() {
  const { pending } = useFormStatus();
  return <button type="submit" className="primaryButton" disabled={pending}>{pending ? "Reading and analyzing…" : "Generate draft"}</button>;
}

export function NewsDraftForm() {
  const router = useRouter();
  const [state, action] = useActionState(generateNewsDraftAction, initialNewsDraftState);
  useEffect(() => { if (state.ok) router.push(`/tools/write/from-news/${state.draftId}` as Route); }, [router, state]);

  return (
    <form action={action} className="editorForm newsImportForm">
      <label className="fieldGroup">
        <span>Primary news URL</span>
        <input name="sourceUrl" type="url" required placeholder="https://example.com/news/article" autoComplete="url" />
      </label>
      <label className="fieldGroup">
        <span>Article text (optional fallback)</span>
        <textarea name="sourceText" rows={10} maxLength={100_000} placeholder="If the source has a paywall or blocks automated access, paste the article text here." />
      </label>
      {!state.ok && state.message ? <p className="formError" role="alert">{state.message}</p> : null}
      <p className="editorHint">The source is treated as untrusted material. A draft is saved for review and is never published automatically.</p>
      <div className="editorActions"><GenerateButton /></div>
    </form>
  );
}
