import Link from "next/link";

export function Footer() {
  return (
    <footer className="siteFooter">
      <div className="container footerBar">
        <p>Stacked AI publishes practical writing on AI tools, workflows, ideas, and the way the space is changing.</p>
        <div className="footerInlineLinks">
          <Link href="/tools">Blog</Link>
          <Link href="/categories">Categories</Link>
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
