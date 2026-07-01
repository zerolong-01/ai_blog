"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { categories } from "@/data/categories";

import { createReviewAction, type ReviewFormState } from "@/app/tools/write/actions";

const initialState: ReviewFormState = {
  error: null
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="primaryButton" type="submit" disabled={pending}>
      {pending ? "Saving review..." : "Publish review"}
    </button>
  );
}

export function ReviewForm() {
  const [state, formAction] = useActionState(createReviewAction, initialState);

  return (
    <form action={formAction} className="editorForm">
      <div className="formGrid">
        <label className="fieldGroup">
          <span>Review title</span>
          <input name="name" type="text" placeholder="Cursor review for fast-moving teams" required />
        </label>

        <label className="fieldGroup">
          <span>Custom slug</span>
          <input name="slug" type="text" placeholder="Optional. Leave blank to auto-generate." />
        </label>

        <label className="fieldGroup fieldSpanFull">
          <span>Tagline</span>
          <input name="tagline" type="text" placeholder="One clear line describing the tool" required />
        </label>

        <label className="fieldGroup">
          <span>Category</span>
          <select name="category" defaultValue="developer" required>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="fieldGroup">
          <span>Official website</span>
          <input name="website" type="url" placeholder="https://example.com" required />
        </label>

        <label className="fieldGroup">
          <span>Price</span>
          <input name="price" type="text" placeholder="Free tier plus paid plans" required />
        </label>

        <label className="fieldGroup">
          <span>Rating</span>
          <input name="rating" type="number" min="0" max="5" step="0.1" defaultValue="4.5" required />
        </label>

        <label className="fieldGroup fieldSpanFull">
          <span>Summary</span>
          <textarea
            name="summary"
            rows={3}
            placeholder="Two or three sentences that explain what the tool is good at and who it is for."
            required
          />
        </label>

        <label className="fieldGroup">
          <span>Best for</span>
          <textarea name="bestFor" rows={4} placeholder={"One item per line\nMarketing teams\nWorkspace search"} />
        </label>

        <label className="fieldGroup">
          <span>Pros</span>
          <textarea name="pros" rows={4} placeholder={"One item per line\nFast setup\nStrong collaboration"} />
        </label>

        <label className="fieldGroup">
          <span>Cons</span>
          <textarea name="cons" rows={4} placeholder={"One item per line\nCan get expensive\nNeeds review"} />
        </label>

        <label className="fieldGroup">
          <span>Features</span>
          <textarea name="features" rows={4} placeholder={"One item per line\nAI search\nBrand voice memory"} />
        </label>

        <label className="fieldGroup fieldSpanFull">
          <span>Final verdict</span>
          <textarea
            name="verdict"
            rows={3}
            placeholder="Short opinionated wrap-up that tells the reader whether the tool is worth it."
            required
          />
        </label>

        <label className="fieldGroup fieldSpanFull">
          <span>Review body in MDX</span>
          <textarea
            name="content"
            rows={16}
            placeholder={`## Overview\n\nExplain what the tool does.\n\n## Best for\n\n- Team type\n- Workflow\n\n## Final take\n\nShare your conclusion.`}
            required
          />
        </label>
      </div>

      {state.error ? <p className="formError">{state.error}</p> : null}

      <div className="editorActions">
        <SubmitButton />
      </div>
    </form>
  );
}
