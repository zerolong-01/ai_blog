"use client";

import { ReactNode } from "react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { createReviewAction, type ReviewFormState, updateReviewAction } from "@/app/tools/write/actions";
import { INPUT_LIMITS } from "@/lib/input-validation";

const initialState: ReviewFormState = {
  error: null
};

type ReviewFormProps = {
  mode?: "create" | "edit";
  seriesOptions?: string[];
  initialValues?: {
    slug?: string;
    name?: string;
    content?: string;
    summary?: string;
    seriesName?: string;
    seriesOrder?: number;
  };
  intro?: ReactNode;
  draftId?: string;
};

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();

  return (
    <button className="primaryButton" type="submit" disabled={pending}>
      {pending ? (mode === "edit" ? "Saving..." : "Publishing...") : mode === "edit" ? "Save changes" : "Publish post"}
    </button>
  );
}

export function ReviewForm({ mode = "create", seriesOptions = [], initialValues, intro, draftId }: ReviewFormProps) {
  const action = mode === "edit" ? updateReviewAction : createReviewAction;
  const [state, formAction] = useActionState(action, initialState);
  const [values, setValues] = useState({
    name: initialValues?.name || "",
    content: initialValues?.content || "",
    seriesName: initialValues?.seriesName || "",
    seriesOrder: initialValues?.seriesOrder?.toString() || ""
  });

  return (
    <form action={formAction} className="editorForm">
      {draftId ? <input type="hidden" name="draftId" value={draftId} /> : null}
      {initialValues?.summary ? <input type="hidden" name="generatedSummary" value={initialValues.summary} /> : null}
      {mode === "edit" && initialValues?.slug ? <input type="hidden" name="slug" value={initialValues.slug} /> : null}

      <div className="formGrid">
        <label className="fieldGroup fieldSpanFull">
          <span>Title</span>
          <input
            name="name"
            type="text"
            placeholder="What AI agents are getting right in 2026"
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
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
            value={values.seriesName}
            onChange={(event) => setValues((current) => ({ ...current, seriesName: event.target.value }))}
            maxLength={INPUT_LIMITS.postSeriesName}
            list="series-options"
          />
          {seriesOptions.length > 0 ? (
            <datalist id="series-options">
              {seriesOptions.map((seriesName) => (
                <option key={seriesName} value={seriesName} />
              ))}
            </datalist>
          ) : null}
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
            value={values.seriesOrder}
            onChange={(event) => setValues((current) => ({ ...current, seriesOrder: event.target.value }))}
          />
        </label>

        <label className="fieldGroup fieldSpanFull">
          <span>Content</span>
          <textarea
            name="content"
            rows={20}
            maxLength={INPUT_LIMITS.postContentBytes}
            value={values.content}
            onChange={(event) => setValues((current) => ({ ...current, content: event.target.value }))}
            placeholder={`## Opening thought\n\nWrite freely in markdown.\n\n- bullet points work\n- headings work\n- links work too\n\n[OpenAI](https://openai.com)`}
            required
          />
        </label>
      </div>

      {state.error ? <p className="formError" role="alert">{state.error}</p> : null}

      {intro}

      <p className="editorHint">Markdown is supported. Headings, lists, links, and paragraphs will render automatically.</p>

      <div className="editorActions">
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}
