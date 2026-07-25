"use client";

import { ReactNode } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createReviewAction, type ReviewFormState, updateReviewAction } from "@/app/tools/write/actions";
import { INPUT_LIMITS } from "@/lib/input-validation";

const initialState: ReviewFormState = {
  error: null
};

type ReviewFormProps = {
  mode?: "create" | "edit";
  initialValues?: {
    slug?: string;
    name?: string;
    content?: string;
    seriesName?: string;
    seriesOrder?: number;
  };
  intro?: ReactNode;
};

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();

  return (
    <button className="primaryButton" type="submit" disabled={pending}>
      {pending ? (mode === "edit" ? "Saving..." : "Publishing...") : mode === "edit" ? "Save changes" : "Publish post"}
    </button>
  );
}

export function ReviewForm({ mode = "create", initialValues, intro }: ReviewFormProps) {
  const action = mode === "edit" ? updateReviewAction : createReviewAction;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="editorForm">
      {mode === "edit" && initialValues?.slug ? <input type="hidden" name="slug" value={initialValues.slug} /> : null}

      <div className="formGrid">
        <label className="fieldGroup fieldSpanFull">
          <span>Title</span>
          <input
            name="name"
            type="text"
            placeholder="What AI agents are getting right in 2026"
            defaultValue={initialValues?.name || ""}
            maxLength={INPUT_LIMITS.postTitle}
            required
          />
        </label>

        <label className="fieldGroup">
          <span>Series name (optional)</span>
          <input
            name="seriesName"
            type="text"
            placeholder="Building a practical AI workflow"
            defaultValue={initialValues?.seriesName || ""}
            maxLength={INPUT_LIMITS.postSeriesName}
          />
        </label>

        <label className="fieldGroup">
          <span>Part number (optional)</span>
          <input
            name="seriesOrder"
            type="number"
            min={1}
            max={INPUT_LIMITS.postSeriesOrder}
            step={1}
            placeholder="1"
            defaultValue={initialValues?.seriesOrder}
          />
        </label>

        <label className="fieldGroup fieldSpanFull">
          <span>Content</span>
          <textarea
            name="content"
            rows={20}
            maxLength={INPUT_LIMITS.postContentBytes}
            defaultValue={initialValues?.content || ""}
            placeholder={`## Opening thought\n\nWrite freely in markdown.\n\n- bullet points work\n- headings work\n- links work too\n\n[OpenAI](https://openai.com)`}
            required
          />
        </label>
      </div>

      {state.error ? <p className="formError">{state.error}</p> : null}

      {intro}

      <p className="editorHint">Markdown is supported. Headings, lists, links, and paragraphs will render automatically.</p>

      <div className="editorActions">
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}
