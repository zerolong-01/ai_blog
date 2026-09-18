import assert from "node:assert/strict";
import test from "node:test";
import { normalizePostPage, normalizePostQuery, postPageCount } from "./post-pagination.ts";

test("bounds malformed, fractional and oversized page parameters", () => {
  for (const value of [undefined, "", "-1", "0", "1.5", "abc", "Infinity"]) assert.equal(normalizePostPage(value), 1);
  assert.equal(normalizePostPage("999999"), 10000);
  assert.equal(normalizePostPage("3"), 3);
});
test("normalizes search and computes complete pagination boundaries", () => {
  assert.equal(normalizePostQuery("  security  "), "security");
  assert.equal(normalizePostQuery("a".repeat(1000)).length, 200);
  assert.equal(postPageCount(0), 1);
  assert.equal(postPageCount(12), 1);
  assert.equal(postPageCount(13), 2);
});
