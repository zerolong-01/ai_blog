import type { Metadata } from "next";

import { AdSlot } from "@/components/ad-slot";
import { ToolCard } from "@/components/tool-card";
import { tools } from "@/data/tools";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI Tools Reviews",
  description: "Browse independent reviews of AI tools across writing, design, developer, productivity, and video categories.",
  alternates: {
    canonical: absoluteUrl("/tools")
  }
};

export default function ToolsPage() {
  return (
    <section className="container pageShell">
      <div className="pageIntro">
        <span className="eyebrow">Review library</span>
        <h1>AI tools review hub</h1>
        <p>
          Every review is structured for readers comparing value, fit, strengths, and tradeoffs before they sign up.
        </p>
      </div>

      <AdSlot slot="reviews-index-banner" format="horizontal" />

      <div className="cardGrid">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </section>
  );
}
