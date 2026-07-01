import Link from "next/link";

export function Footer() {
  return (
    <footer className="siteFooter">
      <div className="container footerGrid">
        <div>
          <h2>About</h2>
          <p>
            Stacked AI Reviews publishes practical, editorial-style reviews for readers comparing modern AI tools.
          </p>
        </div>
        <div>
          <h2>Key Pages</h2>
          <div className="footerLinks">
            <Link href="/tools">All reviews</Link>
            <Link href="/categories">Browse categories</Link>
            <Link href="/search">Search tools</Link>
          </div>
        </div>
        <div>
          <h2>AdSense Readiness</h2>
          <p>
            The layout reserves ad placements without overwhelming content, which is a better fit for approval-focused publishing.
          </p>
        </div>
      </div>
    </footer>
  );
}
