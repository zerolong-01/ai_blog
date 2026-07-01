"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createReviewAction, type ReviewFormState } from "@/app/tools/write/actions";

const initialState: ReviewFormState = {
  error: null
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="primaryButton" type="submit" disabled={pending}>
      {pending ? "Publishing..." : "Publish post"}
    </button>
  );
}

export function ReviewForm() {
  const [state, formAction] = useActionState(createReviewAction, initialState);

  return (
    <form action={formAction} className="editorForm">
      <div className="formGrid">
        <label className="fieldGroup fieldSpanFull">
          <span>Title</span>
          <input name="name" type="text" placeholder="What AI agents are getting right in 2026" required />
        </label>

        <label className="fieldGroup fieldSpanFull">
          <span>Content</span>
          <textarea
            name="content"
            rows={20}
            placeholder={`## Opening thought\n\nWrite freely in markdown.\n\n- bullet points work\n- headings work\n- links work too\n\n[OpenAI](https://openai.com)`}
            required
          />
        </label>
      </div>

      {state.error ? <p className="formError">{state.error}</p> : null}

      <p className="editorHint">Markdown is supported. Headings, lists, links, and paragraphs will render automatically.</p>

      <div className="editorActions">
        <SubmitButton />
      </div>
    </form>
  );
}
