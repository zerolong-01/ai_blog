import type { Metadata } from "next";
import Link from "next/link";

import { absoluteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Stacked AI collects, uses, and protects visitor information.",
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
        <p>How Stacked AI collects, uses, and protects information when you browse the site or contact us.</p>
      </div>

      <div className="legalContent proseReview">
        <p>
          This policy explains the kinds of information Stacked AI may collect, how that information is used, and the
          choices available to visitors. By using the site, you agree to the practices described here.
        </p>

        <h2>Information we collect</h2>
        <p>
          We may collect basic analytics data, browser and device information, referral sources, and information you
          voluntarily provide when contacting us by email.
        </p>

        <h2>How information is used</h2>
        <p>
          Information is used to operate the site, understand readership trends, respond to messages, improve content,
          prevent abuse, and maintain the performance and security of the service.
        </p>

        <h2>Cookies and analytics</h2>
        <p>
          This site may use cookies and analytics tools, including Google Analytics and advertising-related services,
          to measure traffic and support site operations.
        </p>

        <h2>Advertising and third-party tools</h2>
        <p>
          If advertising, embedded media, or affiliate tracking tools are enabled, those services may collect limited
          technical data under their own policies. Stacked AI does not control how those third parties handle data
          after it is collected on their systems.
        </p>

        <h2>Third-party services</h2>
        <p>
          Third-party platforms such as analytics, hosting, and advertising providers may process limited technical
          data according to their own privacy policies.
        </p>

        <h2>Data retention</h2>
        <p>
          We keep personal information only as long as reasonably necessary to respond to inquiries, maintain records,
          comply with legal obligations, or protect the site from misuse.
        </p>

        <h2>Your choices</h2>
        <p>
          You can limit cookies through your browser settings and may contact us to request deletion of information you
          have directly provided, subject to legal or operational requirements.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy-related questions, email <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>{" "}
          or visit the <Link href="/contact">contact page</Link>.
        </p>
      </div>
    </section>
  );
}
