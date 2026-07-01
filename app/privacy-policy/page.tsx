import type { Metadata } from "next";

import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Stacked AI.",
  alternates: {
    canonical: absoluteUrl("/privacy-policy")
  }
};

export default function PrivacyPolicyPage() {
  return (
    <section className="container pageShell legalShell">
      <div className="pageIntro">
        <span className="eyebrow">Policy</span>
        <h1>Privacy Policy</h1>
        <p>How Stacked AI collects, uses, and protects basic visitor information.</p>
      </div>

      <div className="legalContent proseReview">
        <h2>Information we collect</h2>
        <p>
          We may collect basic analytics, device information, and information voluntarily submitted through contact
          forms or email.
        </p>

        <h2>How information is used</h2>
        <p>
          Information is used to operate the site, understand readership trends, respond to messages, and improve
          content quality.
        </p>

        <h2>Cookies and analytics</h2>
        <p>
          This site may use cookies and analytics tools, including Google Analytics and advertising-related services,
          to measure traffic and support site operations.
        </p>

        <h2>Third-party services</h2>
        <p>
          Third-party platforms such as analytics, hosting, and advertising providers may process limited technical
          data according to their own privacy policies.
        </p>

        <h2>Contact</h2>
        <p>For privacy-related questions, use the contact page linked in the footer.</p>
      </div>
    </section>
  );
}
