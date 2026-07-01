import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: false
});

export async function renderMarkdown(source: string) {
  return marked.parse(source);
}
