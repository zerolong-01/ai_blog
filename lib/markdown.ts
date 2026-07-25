import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

marked.setOptions({
  gfm: true,
  breaks: false
});

marked.use({
  renderer: {
    html() {
      return "";
    }
  }
});

export async function renderMarkdown(source: string) {
  const rendered = await marked.parse(source);

  return sanitizeHtml(rendered, {
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
      a: ["href", "title", "rel"],
      code: ["class"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      th: ["align"],
      td: ["align"]
    },
    allowedClasses: {
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
}
