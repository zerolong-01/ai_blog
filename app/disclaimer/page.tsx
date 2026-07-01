import type { Metadata } from "next";

import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Editorial and affiliate disclaimer for Stacked AI.",
  alternates: {
    canonical: absoluteUrl("/disclaimer")
  }
};

export default function DisclaimerPage() {
  return (
    <section className="container pageShell legalShell">
      <div className="pageIntro">
        <span className="eyebrow">Policy</span>
        <h1>Disclaimer</h1>
        <p>Important context about editorial content, opinions, and potential monetization.</p>
      </div>

      <div className="legalContent proseReview">
        <h2>Editorial opinion</h2>
        <p>
          Articles on Stacked AI reflect editorial judgment and personal analysis. They should not be treated as legal,
          financial, medical, or professional advice.
        </p>

        <h2>Accuracy</h2>
        <p>
          AI products, pricing, and capabilities change quickly. While we aim for accuracy, readers should verify key
          details directly with the original provider.
        </p>

        <h2>Ads and affiliate relationships</h2>
        <p>
          This site may display ads or use affiliate links in the future. If that happens, those relationships may
          generate revenue at no additional cost to the reader.
        </p>
      </div>
    </section>
  );
}
