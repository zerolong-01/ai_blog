import assert from "node:assert/strict";
import test from "node:test";

import { renderMarkdown } from "./markdown.ts";

test("keeps supported Markdown formatting", async () => {
  const html = await renderMarkdown("## Heading\n\n**Bold** and `code`.\n\n- one\n- two");

  assert.match(html, /<h2>Heading<\/h2>/);
  assert.match(html, /<strong>Bold<\/strong>/);
  assert.match(html, /<code>code<\/code>/);
  assert.match(html, /<ul>/);
});

test("removes raw HTML and executable elements", async () => {
  const html = await renderMarkdown('Safe\n\n<script>alert("xss")</script>\n\n<img src=x onerror=alert(1)>');

  assert.match(html, /Safe/);
  assert.doesNotMatch(html, /script|onerror|alert|<img/i);
});

test("removes unsafe link and image schemes", async () => {
  const html = await renderMarkdown(
    "[unsafe](javascript:alert(1))\n\n![unsafe image](data:text/html;base64,PHNjcmlwdD4=)"
  );

  assert.match(html, />unsafe<\/a>/);
  assert.doesNotMatch(html, /javascript:|data:/i);
});

test("adds noopener and noreferrer to external links", async () => {
  const html = await renderMarkdown("[External](https://example.com) and [Internal](/tools)");

  assert.match(html, /href="https:\/\/example\.com" rel="noopener noreferrer"/);
  assert.match(html, /href="\/tools"/);

  const internalLink = html.match(/<a href="\/tools"[^>]*>/)?.[0] || "";
  assert.doesNotMatch(internalLink, /rel=/);
});

test("keeps safe images and forces lazy loading", async () => {
  const html = await renderMarkdown("![Example](https://example.com/image.png)");

  assert.match(html, /src="https:\/\/example\.com\/image\.png"/);
  assert.match(html, /loading="lazy"/);
});
