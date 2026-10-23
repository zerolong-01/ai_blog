import Link from "next/link";
import { UiIcon } from "@/components/ui-icon";

export function Footer() {
  return (
    <footer className="siteFooter">
      <div className="container footerBar">
        <div className="footerIdentity">
          <Link href="/" className="footerWordmark">
            Stacked AI<span className="headingDot">.</span>
          </Link>
          <p>
            A clearer view of AI, security,
            <br />
            and what comes next.
          </p>
          <Link href="/rss.xml" className="textLink">
            Follow via RSS <UiIcon name="arrow" />
          </Link>
        </div>
        <div className="footerInlineLinks">
          <Link href="/tools">Journal</Link>
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
