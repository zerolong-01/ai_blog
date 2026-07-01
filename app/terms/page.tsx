import type { Metadata } from "next";

import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for Stacked AI.",
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
        <p>The basic terms governing access to and use of Stacked AI.</p>
      </div>

      <div className="legalContent proseReview">
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

        <h2>No warranty</h2>
        <p>
          Content is provided for general informational purposes and may change over time. We do not guarantee
          completeness, accuracy, or uninterrupted availability.
        </p>

        <h2>External links</h2>
        <p>Links to third-party services are provided for convenience and do not imply endorsement.</p>
      </div>
    </section>
  );
}
