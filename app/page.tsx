import type { Metadata } from "next";
import Link from "next/link";

import { ToolCard } from "@/components/tool-card";
import { categories } from "@/data/categories";
import { getAllReviewMeta } from "@/lib/reviews";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI Blog",
  description: "Thoughtful writing about AI tools, workflows, trends, and the broader ideas shaping how people use AI.",
  alternates: {
    canonical: absoluteUrl("/")
  }
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await getAllReviewMeta();
  const latestPosts = posts.slice(0, 6);
  const activeCategories = categories
    .map((category) => ({
      ...category,
      postCount: posts.filter((post) => post.category === category.slug).length
    }))
    .filter((category) => category.postCount > 0);

  return (
    <>
      <section className="minimalHero">
        <div className="container minimalHeroGrid">
          <div className="minimalHeroCopy">
            <span className="eyebrow">Independent AI blog</span>
            <h1>Thoughtful writing about AI.</h1>
            <p className="heroCopy">
              Notes on tools, workflows, trends, and the broader ideas shaping how people use AI.
            </p>
            <div className="ctaRow">
              <Link href="#latest-posts" className="primaryButton">
                Read the latest
              </Link>
              <Link href="/categories" className="secondaryButton">
                Browse topics
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

      <section id="latest-posts" className="container homeSection" aria-labelledby="latest-posts-heading">
        <div className="sectionHeading">
          <div>
            <span className="eyebrow">Fresh from the blog</span>
            <h2 id="latest-posts-heading">Latest posts</h2>
          </div>
          <Link href="/tools" className="textLink">
            View all posts
          </Link>
        </div>

        {latestPosts.length > 0 ? (
          <div className="cardGrid">
            {latestPosts.map((post) => (
              <ToolCard key={post.slug} tool={post} />
            ))}
          </div>
        ) : (
          <p className="emptyState">New writing is on the way. Check back soon.</p>
        )}
      </section>

      {activeCategories.length > 0 ? (
        <section className="container homeSection" aria-labelledby="home-categories-heading">
          <div className="sectionHeading">
            <div>
              <span className="eyebrow">Explore by topic</span>
              <h2 id="home-categories-heading">Browse categories</h2>
            </div>
            <Link href="/categories" className="textLink">
              View all categories
            </Link>
          </div>

          <div className="categoryGrid">
            {activeCategories.map((category) => (
              <Link key={category.slug} href={`/categories/${category.slug}`} className="categoryCard">
                <span className="categoryCount">
                  {category.postCount} {category.postCount === 1 ? "post" : "posts"}
                </span>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
