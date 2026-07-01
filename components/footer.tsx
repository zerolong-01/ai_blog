import Link from "next/link";

export function Footer() {
  return (
    <footer className="siteFooter">
      <div className="container footerBar">
        <p>Stacked AI Reviews publishes practical editorial reviews for modern AI products.</p>
        <div className="footerInlineLinks">
          <Link href="/tools">Reviews</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/search">Search</Link>
        </div>
      </div>
    </footer>
  );
}
