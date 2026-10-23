import assert from "node:assert/strict";
import test from "node:test";

import { renderMarkdown, renderMarkdownDocument } from "./markdown.ts";

test("keeps supported Markdown formatting", async () => {
  const html = await renderMarkdown("## Heading\n\n**Bold** and `code`.\n\n- one\n- two");

  assert.match(html, /<h2 id="section-heading" tabindex="-1">Heading/);
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

test("builds unique heading targets for duplicates, suffix collisions and Korean", async () => {
  const document = await renderMarkdownDocument("# Title\n\n## 보안 안내\n\n### 보안 안내\n\n## 보안 안내-2\n\n#### Detail");
  assert.deepEqual(document.headings.map(({ id, depth }) => ({ id, depth })), [
    { id: "section-보안-안내", depth: 2 },
    { id: "section-보안-안내-2", depth: 3 },
    { id: "section-보안-안내-2-2", depth: 2 }
  ]);
  for (const { id } of document.headings) {
    assert.ok(document.html.includes(`id="${id}"`));
    assert.ok(document.html.includes(`href="#${id}"`));
  }
  assert.match(document.html, /id="section-title"/);
  assert.match(document.html, /id="section-detail"/);
});

test("keeps inline TOC formatting without nested links, images or executable HTML", async () => {
  const document = await renderMarkdownDocument('## **Bold** &amp; [link](javascript:alert(1)) `code`\n\n## <img src=x onerror=alert(1)>Safe\n\n```md\n## Not a heading\n```');
  assert.equal(document.headings.length, 2);
  assert.equal(document.headings[0].html, "<strong>Bold</strong> &amp; link <code>code</code>");
  assert.doesNotMatch(document.headings.map(({ html }) => html).join(""), /<a|<img|javascript:|onerror/i);
  assert.doesNotMatch(document.html, /<img|onerror|javascript:/i);
  assert.ok(document.headings.every(({ id }) => /^[\p{L}\p{N}-]+$/u.test(id)));
});

test("isolates simultaneous renders and uses identical preview and article HTML", async () => {
  const source = "## Repeated\n\n## Repeated";
  const [left, right, preview] = await Promise.all([
    renderMarkdownDocument(source), renderMarkdownDocument(source), renderMarkdown(source)
  ]);
  assert.deepEqual(left, right);
  assert.equal(preview, left.html);
  assert.deepEqual(left.headings.map(({ id }) => id), ["section-repeated", "section-repeated-2"]);
});

test("bounds Unicode anchors without splitting code points and handles symbol headings", async () => {
  const document = await renderMarkdownDocument(`## ${"𠀀".repeat(100)}\n\n## 🔐\n\n## 🔐`);
  assert.equal(document.headings[0].id, `section-${"𠀀".repeat(80)}`);
  assert.deepEqual(document.headings.slice(1).map(({ id }) => id), ["section-heading", "section-heading-2"]);
  assert.ok(document.html.includes(`id="${document.headings[0].id}"`));
});

test("estimates English, CJK and mixed reading time with a one-minute minimum", async () => {
  assert.equal((await renderMarkdownDocument("")).readingMinutes, 1);
  assert.equal((await renderMarkdownDocument("word ".repeat(200))).readingMinutes, 1);
  assert.equal((await renderMarkdownDocument("word ".repeat(201))).readingMinutes, 2);
  assert.equal((await renderMarkdownDocument("한".repeat(501))).readingMinutes, 2);
  assert.equal((await renderMarkdownDocument("한".repeat(250) + " word".repeat(100))).readingMinutes, 1);
});
