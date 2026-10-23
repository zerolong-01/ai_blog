import { Marked } from "marked";
import sanitizeHtml from "sanitize-html";

export type MarkdownHeading = {
  id: string;
  depth: number;
  html: string;
};

function readingMinutes(html: string) {
  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
  const cjk = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu;
  const characters = text.match(cjk)?.length ?? 0;
  const words = text.replace(cjk, " ").match(/[\p{L}\p{N}]+/gu)?.length ?? 0;
  // Approximate mixed-language reading time, including code, rounded up to a minute.
  return Math.max(1, Math.ceil(characters / 500 + words / 200));
}

export async function renderMarkdownDocument(source: string) {
  const headings: MarkdownHeading[] = [];
  const usedIds = new Set<string>();
  const parser = new Marked({ gfm: true, breaks: false });
  parser.use({
    renderer: {
      html() {
        return "";
      },
      heading({ tokens, depth }) {
        const inline = this.parser.parseInline(tokens);
        const title = sanitizeHtml(inline, {
          allowedTags: ["strong", "em", "code", "del"],
          allowedAttributes: {}
        });
        const plainTitle = this.parser.parseInline(tokens, this.parser.textRenderer);
        const normalizedTitle = plainTitle.normalize("NFKC").toLowerCase()
          .replace(/<[^>]*>/g, "")
          .replace(/[^\p{L}\p{N}]+/gu, "-")
          .replace(/^-+|-+$/g, "");
        const slug = Array.from(normalizedTitle).slice(0, 80).join("").replace(/-+$/, "") || "heading";
        const baseId = `section-${slug}`;
        let id = baseId;
        for (let suffix = 2; usedIds.has(id); suffix += 1) {
          id = `${baseId}-${suffix}`;
        }
        usedIds.add(id);

        if ((depth === 2 || depth === 3) && title.trim()) {
          headings.push({ id, depth, html: title });
        }
        return `<h${depth} id="${id}" tabindex="-1">${inline}<a class="headingAnchor" href="#${id}" aria-label="Link to this section">#</a></h${depth}>\n`;
      }
    }
  });
  const rendered = await parser.parse(source);

  const html = sanitizeHtml(rendered, {
    allowedTags: [
      "p",
      "br",
      "hr",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "ul",
      "ol",
      "li",
      "strong",
      "em",
      "del",
      "code",
      "pre",
      "a",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td"
    ],
    allowedAttributes: {
      a: ["href", "title", "rel", "class", "aria-label"],
      h1: ["id", "tabindex"],
      h2: ["id", "tabindex"],
      h3: ["id", "tabindex"],
      h4: ["id", "tabindex"],
      h5: ["id", "tabindex"],
      h6: ["id", "tabindex"],
      code: ["class"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      th: ["align"],
      td: ["align"]
    },
    allowedClasses: {
      a: ["headingAnchor"],
      code: [/^language-[a-z0-9_-]+$/i]
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https"]
    },
    allowProtocolRelative: false,
    enforceHtmlBoundary: true,
    transformTags: {
      a(tagName, attributes) {
        const href = attributes.href || "";

        if (/^https?:\/\//i.test(href)) {
          return {
            tagName,
            attribs: {
              ...attributes,
              rel: "noopener noreferrer"
            }
          };
        }

        return { tagName, attribs: attributes };
      },
      img(tagName, attributes) {
        return {
          tagName,
          attribs: {
            ...attributes,
            loading: "lazy"
          }
        };
      }
    }
  });

  return { html, headings, readingMinutes: readingMinutes(html) };
}

export async function renderMarkdown(source: string) {
  return (await renderMarkdownDocument(source)).html;
}
