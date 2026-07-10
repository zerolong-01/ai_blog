import { marked } from "marked";

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
  return marked.parse(source);
}
