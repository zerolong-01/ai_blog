export function ThemeScript({ nonce }: { nonce?: string }) {
  const script = `
    (() => {
      const stored = window.localStorage.getItem("theme");
      const preferred = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      document.documentElement.dataset.theme = preferred;
    })();
  `;

  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: script }} />;
}
