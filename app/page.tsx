import Link from "next/link";

export default function HomePage() {
  return (
    <section className="minimalHero">
      <div className="container minimalHeroGrid">
        <div className="minimalHeroCopy">
          <span className="eyebrow">Independent AI library</span>
          <h1>Find the right AI tools.</h1>
          <p className="heroCopy">
            A clean place to explore useful AI products by category, purpose, and workflow.
          </p>
          <div className="ctaRow">
            <Link href="/tools" className="primaryButton">
              Get started
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
