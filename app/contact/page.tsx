import type { Metadata } from "next";
import Link from "next/link";

import { absoluteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Stacked AI for corrections, partnerships, and editorial questions.",
  alternates: {
    canonical: absoluteUrl("/contact")
  }
};

export default function ContactPage() {
  return (
    <section className="container pageShell legalShell">
      <div className="pageIntro">
        <span className="eyebrow">Contact</span>
        <h1>Contact</h1>
        <p>Reach out about corrections, partnerships, licensing, or general editorial questions.</p>
      </div>

      <div className="legalContent proseReview">
        <p>
          Stacked AI is an editorial site focused on AI tools, workflows, and broader shifts in how people use AI at
          work. If you notice something inaccurate, want to share a product update, or need to discuss a business
          matter, email is the fastest route.
        </p>

        <h2>Email</h2>
        <p>
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
        </p>

        <h2>What to include</h2>
        <p>
          For corrections, include the page URL and the specific detail that needs updating. For partnerships or media
          inquiries, include your timeline, relevant links, and the best way to reach you back.
        </p>

        <h2>Response expectations</h2>
        <p>
          We aim to review messages within a few business days. Time-sensitive issues such as factual corrections or
          legal notices are prioritized.
        </p>

        <h2>Related pages</h2>
        <p>
          For more context on how the site operates, review the <Link href="/privacy-policy">Privacy Policy</Link>,{" "}
          <Link href="/terms">Terms</Link>, and <Link href="/disclaimer">Disclaimer</Link>.
        </p>
      </div>
    </section>
  );
}
