import Link from "next/link";

import { categories, tools } from "@/data/tools";

export default function HomePage() {
  const featuredNames = tools.slice(0, 4).map((tool) => tool.name);

  return (
    <section className="minimalHero">
      <div className="container minimalHeroGrid">
        <div className="minimalHeroCopy">
          <span className="eyebrow">Independent AI tool reviews</span>
          <h1>Less hype. Better AI tools.</h1>
          <p className="heroCopy">
            Clear, readable reviews for people comparing AI products before they subscribe, switch, or spend.
          </p>
          <div className="ctaRow">
            <Link href="/tools" className="primaryButton">
              Start reading
            </Link>
            <Link href="/categories" className="secondaryButton">
              Browse topics
            </Link>
          </div>

          <div className="minimalMeta">
            <p>Featured in the library</p>
            <div className="inlineLinks">
              {featuredNames.map((name) => (
                <span key={name}>{name}</span>
              ))}
            </div>
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

      <div className="container homeUtilityRow">
        <div className="compactPanel">
          <span className="compactLabel">Why it stays clean</span>
          <p>The homepage is intentionally light. Reviews, categories, and search live one click away.</p>
        </div>
        <div className="compactLinks">
          <Link href="/tools">All reviews</Link>
          <Link href="/search">Search</Link>
          {categories.slice(0, 3).map((category) => (
            <Link key={category.slug} href={`/categories/${category.slug}`}>
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
