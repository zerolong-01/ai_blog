import type { Metadata } from "next";
import Link from "next/link";

import { absoluteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms governing access to and use of Stacked AI.",
  alternates: {
    canonical: absoluteUrl("/terms")
  }
};

export default function TermsPage() {
  return (
    <section className="container pageShell legalShell">
      <div className="pageIntro">
        <span className="eyebrow">Policy</span>
        <h1>Terms</h1>
        <p>The terms governing access to and use of the Stacked AI website and its editorial content.</p>
      </div>

      <div className="legalContent proseReview">
        <p>
          These terms apply to your use of Stacked AI. If you do not agree with them, please do not use the site.
        </p>

        <h2>Use of the site</h2>
        <p>
          By using this site, you agree to use the content lawfully and without attempting to disrupt, misuse, or copy
          material in ways that violate applicable law.
        </p>

        <h2>Content ownership</h2>
        <p>
          Unless otherwise stated, written content on Stacked AI is owned by the site publisher and may not be reused
          in full without permission.
        </p>

        <h2>Permitted use</h2>
        <p>
          You may read, reference, and share links to published articles for personal or internal business use. You
          may not scrape, republish, mirror, or mass-distribute site content in a way that substitutes for the
          original publication.
        </p>

        <h2>No warranty</h2>
        <p>
          Content is provided for general informational purposes and may change over time. We do not guarantee
          completeness, accuracy, or uninterrupted availability.
        </p>

        <h2>External links</h2>
        <p>Links to third-party services are provided for convenience and do not imply endorsement.</p>

        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent allowed by law, Stacked AI is not liable for damages resulting from reliance on site
          content, service interruptions, or third-party products and websites linked from the site.
        </p>

        <h2>Changes to these terms</h2>
        <p>
          We may update these terms as the site evolves. Continued use of the site after changes are published means
          you accept the revised terms.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms can be sent to <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>{" "}
          or through the <Link href="/contact">contact page</Link>.
        </p>
      </div>
    </section>
  );
}
