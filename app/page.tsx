import Link from "next/link";

import { AdSlot } from "@/components/ad-slot";
import { ToolCard } from "@/components/tool-card";
import { categories, tools } from "@/data/tools";

const featuredTools = tools.slice(0, 3);

export default function HomePage() {
  return (
    <>
      <section className="heroSection">
        <div className="container heroGrid">
          <div>
            <span className="eyebrow">Editorial AI software reviews for English-speaking markets</span>
            <h1>Find AI tools that are actually worth paying for.</h1>
            <p className="heroCopy">
              Compare AI writing, design, developer, productivity, and video tools with practical reviews built for readers in the US and UK.
            </p>
            <div className="ctaRow">
              <Link href="/tools" className="primaryButton">
                Explore reviews
              </Link>
              <Link href="/search" className="secondaryButton">
                Search tools
              </Link>
            </div>
          </div>

          <div className="heroPanel">
            <p>Why this structure works for AdSense approval</p>
            <ul>
              <li>Content-first layout with readable review pages</li>
              <li>Clear navigation, category hubs, and internal links</li>
              <li>Reserved ad slots without aggressive ad density</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="container sectionSpacing">
        <AdSlot slot="home-top-banner" format="horizontal" />
      </section>

      <section className="container sectionSpacing">
        <div className="sectionHeading">
          <div>
            <span className="eyebrow">Featured reviews</span>
            <h2>Start with the tools readers compare most often</h2>
          </div>
          <Link href="/tools" className="textLink">
            View all reviews
          </Link>
        </div>
        <div className="cardGrid">
          {featuredTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      <section className="container sectionSpacing">
        <div className="sectionHeading">
          <div>
            <span className="eyebrow">Browse by category</span>
            <h2>Build authority around clear topical clusters</h2>
          </div>
        </div>
        <div className="categoryGrid">
          {categories.map((category) => (
            <Link key={category.slug} href={`/categories/${category.slug}`} className="categoryCard">
              <h3>{category.name}</h3>
              <p>{category.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
