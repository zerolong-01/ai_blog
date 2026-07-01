import type { Metadata } from "next";
import Link from "next/link";

import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI Blog",
  description: "Thoughtful writing about AI tools, workflows, trends, and the broader ideas shaping how people use AI.",
  alternates: {
    canonical: absoluteUrl("/")
  }
};

export default function HomePage() {
  return (
    <section className="minimalHero">
      <div className="container minimalHeroGrid">
        <div className="minimalHeroCopy">
          <span className="eyebrow">Independent AI blog</span>
          <h1>Thoughtful writing about AI.</h1>
          <p className="heroCopy">
            Notes on tools, workflows, trends, and the broader ideas shaping how people use AI.
          </p>
          <div className="ctaRow">
            <Link href="/tools" className="primaryButton">
              Read the blog
            </Link>
          </div>
        </div>

        <div className="minimalArtwork" aria-hidden="true">
          <div className="artFlower" />
          <div className="artBox" />
          <div className="artLine artLineOne" />
          <div className="artLine artLineTwo" />
          <div className="artDot artDotOne" />
          <div className="artDot artDotTwo" />
          <div className="artDot artDotThree" />
        </div>
      </div>
    </section>
  );
}
