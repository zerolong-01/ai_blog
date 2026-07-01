import type { Metadata } from "next";
import Link from "next/link";

import { absoluteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Editorial, accuracy, and monetization disclosures for Stacked AI.",
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
        <p>Important context about editorial judgment, product accuracy, and how monetization may work on the site.</p>
      </div>

      <div className="legalContent proseReview">
        <p>
          Stacked AI publishes opinionated editorial coverage of AI tools and workflows. This page clarifies how to
          interpret that content and what readers should verify on their own.
        </p>

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

        <h2>No professional advice</h2>
        <p>
          Content is provided for informational purposes only and should not be relied on as a substitute for
          professional advice tailored to your specific legal, financial, compliance, or business situation.
        </p>

        <h2>Ads and affiliate relationships</h2>
        <p>
          This site may display ads or use affiliate links in the future. If that happens, those relationships may
          generate revenue at no additional cost to the reader.
        </p>

        <h2>Product references</h2>
        <p>
          Mentioning a tool, company, or service does not mean that provider endorses Stacked AI or has reviewed the
          article before publication.
        </p>

        <h2>Questions</h2>
        <p>
          If you believe an article should be corrected or clarified, email <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>{" "}
          or use the <Link href="/contact">contact page</Link>.
        </p>
      </div>
    </section>
  );
}
