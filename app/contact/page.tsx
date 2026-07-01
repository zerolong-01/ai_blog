import type { Metadata } from "next";

import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Stacked AI.",
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
        <p>Reach out for editorial questions, corrections, or business inquiries.</p>
      </div>

      <div className="legalContent proseReview">
        <p>
          For now, the simplest contact method is email. Replace the placeholder below with your preferred public
          address before launch.
        </p>
        <p>
          Email: <a href="mailto:hello@example.com">hello@example.com</a>
        </p>
      </div>
    </section>
  );
}
