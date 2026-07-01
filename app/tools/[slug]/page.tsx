import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ad-slot";
import { renderMarkdown } from "@/lib/markdown";
import { getAllReviewMeta, getReviewBySlug } from "@/lib/reviews";
import { absoluteUrl } from "@/lib/site";
import { formatDate, slugToTitle } from "@/lib/utils";

type ToolPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const tools = await getAllReviewMeta();
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getReviewBySlug(slug);

  if (!tool) {
    return {
      title: slugToTitle(slug)
    };
  }

  return {
    title: `${tool.name} Review`,
    description: tool.summary,
    alternates: {
      canonical: absoluteUrl(`/tools/${tool.slug}`)
    },
    openGraph: {
      title: `${tool.name} Review`,
      description: tool.summary,
      url: absoluteUrl(`/tools/${tool.slug}`),
      type: "article"
    }
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = await getReviewBySlug(slug);

  if (!tool) {
    notFound();
  }

  const reviewContent = await renderMarkdown(tool.content);

  return (
    <article className="container reviewShell">
      <header className="reviewHeader">
        <div>
          <span className="pill">{tool.category}</span>
          <h1>{tool.name} Review</h1>
          <p className="heroCopy">{tool.tagline}</p>
        </div>
        <div className="scoreCard">
          <span>Editor rating</span>
          <strong>{tool.rating.toFixed(1)} / 5</strong>
          <small>Updated {formatDate(tool.updatedAt)}</small>
        </div>
      </header>

      <div className="reviewLayout">
        <section className="reviewContent">
          <div className="contentCard">
            <h2>Quick verdict</h2>
            <p>{tool.summary}</p>
            <p>{tool.verdict}</p>
            <a href={tool.website} target="_blank" rel="noreferrer" className="primaryButton">
              Visit official website
            </a>
          </div>

          <AdSlot slot={`${tool.slug}-inline`} format="rectangle" />

          <div className="contentCard">
            <h2>Best for</h2>
            <ul className="simpleList">
              {tool.bestFor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="dualGrid">
            <div className="contentCard">
              <h2>Pros</h2>
              <ul className="simpleList">
                {tool.pros.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="contentCard">
              <h2>Cons</h2>
              <ul className="simpleList">
                {tool.cons.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="contentCard">
            <h2>Standout features</h2>
            <ul className="simpleList">
              {tool.features.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="contentCard proseReview">
            <div dangerouslySetInnerHTML={{ __html: reviewContent }} />
          </div>
        </section>

        <aside className="reviewSidebar">
          <div className="contentCard">
            <h2>At a glance</h2>
            <dl className="detailList">
              <div>
                <dt>Price</dt>
                <dd>{tool.price}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{tool.category}</dd>
              </div>
              <div>
                <dt>Publisher link</dt>
                <dd>
                  <a href={tool.website} target="_blank" rel="noreferrer">
                    {tool.website.replace("https://", "")}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div className="contentCard">
            <h2>Keep browsing</h2>
            <div className="footerLinks">
              <Link href={`/categories/${tool.category}`}>More in this category</Link>
              <Link href="/tools">All reviews</Link>
              <Link href="/search">Search tools</Link>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
