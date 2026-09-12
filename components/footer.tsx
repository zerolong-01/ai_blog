import Link from "next/link";

export function Footer() {
  return (
    <footer className="siteFooter">
      <div className="container footerBar">
        <p><strong>Stacked AI</strong> — Signal over noise in artificial intelligence.</p>
        <div className="footerInlineLinks">
          <Link href="/tools">Blog</Link>
          <Link href="/series">Series</Link>
          <Link href="/search">Search</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/disclaimer">Disclaimer</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
