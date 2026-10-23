import { randomUUID } from "node:crypto";
import { INPUT_LIMITS } from "./input-validation.ts";

export function normalizePostSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createPostSlug(title: string, preferredSlug?: string) {
  if (!title.trim()) {
    throw new Error("A valid post title is required.");
  }

  const slug = normalizePostSlug(preferredSlug?.trim() || title)
    .slice(0, INPUT_LIMITS.postSlug)
    .replace(/-+$/, "");

  return slug || `post-${randomUUID()}`;
}
