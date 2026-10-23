import assert from "node:assert/strict";
import test from "node:test";
import { createPostSlug, normalizePostSlug } from "./post-slug.ts";
import { INPUT_LIMITS } from "./input-validation.ts";

test("allocates distinct ASCII addresses for Korean and symbol-only titles", () => {
  const slugs = ["오늘의 정보보안 소식", "오늘의 정보보안 소식", "🔐", "日本語の記事"]
    .map((title) => createPostSlug(title));

  for (const slug of slugs) {
    assert.match(slug, /^post-[0-9a-f-]{36}$/);
    assert.equal(normalizePostSlug(slug), slug);
  }
  assert.equal(new Set(slugs).size, slugs.length);
});

test("preserves existing English, mixed-title and explicit address conventions", () => {
  assert.equal(createPostSlug("Cursor: AI Editor!"), "cursor-ai-editor");
  assert.equal(createPostSlug("AI 보안 가이드 2026"), "ai-2026");
  assert.equal(createPostSlug("한글 제목", " existing-article-2 "), "existing-article-2");
  assert.equal(normalizePostSlug("CURSOR---AI"), "cursor-ai");
  assert.equal(createPostSlug("Cursor", "   "), "cursor");
});

test("bounds addresses without a trailing separator and rejects empty titles", () => {
  const slug = createPostSlug(`${"a".repeat(INPUT_LIMITS.postSlug - 1)} b`);
  assert.equal(slug, "a".repeat(INPUT_LIMITS.postSlug - 1));
  assert.equal(createPostSlug("a".repeat(500)).length, INPUT_LIMITS.postSlug);
  assert.throws(() => createPostSlug(" \n ", "custom"), /valid post title/);
});
