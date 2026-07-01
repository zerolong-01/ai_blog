export function ThemeScript() {
  const script = `
    (() => {
      const stored = window.localStorage.getItem("theme");
      const preferred = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      document.documentElement.dataset.theme = preferred;
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
