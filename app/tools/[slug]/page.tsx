import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

import { ToolCard } from "@/components/tool-card";
import { renderMarkdownDocument } from "@/lib/markdown";
import { getAllReviewMeta, getReviewBySlug } from "@/lib/reviews";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { formatDate, slugToTitle } from "@/lib/utils";
import { ArticleActions } from "@/components/article-actions";

type ToolPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getReviewBySlug(slug);

  if (!tool) {
    return {
      title: slugToTitle(slug),
    };
  }

  return {
    title: tool.name,
    description: tool.summary,
    alternates: {
      canonical: absoluteUrl(`/tools/${tool.slug}`),
    },
    openGraph: {
      title: tool.name,
      description: tool.summary,
      url: absoluteUrl(`/tools/${tool.slug}`),
      type: "article",
      publishedTime: new Date(tool.publishedAt).toISOString(),
      modifiedTime: new Date(tool.updatedAt).toISOString(),
      authors: [tool.author],
      section: tool.category,
      images: [
        {
          url: absoluteUrl(`/tools/${tool.slug}/opengraph-image`),
          width: 1200,
          height: 630,
          alt: tool.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: tool.name,
      description: tool.summary,
      images: [absoluteUrl(`/tools/${tool.slug}/opengraph-image`)],
    },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const nonce = (await headers()).get("x-nonce") || undefined;
  const [tool, posts] = await Promise.all([getReviewBySlug(slug), getAllReviewMeta()]);

  if (!tool) {
    notFound();
  }

  const document = await renderMarkdownDocument(tool.content);
  const currentIndex = posts.findIndex((post) => post.slug === tool.slug);
  const seriesPosts = tool.seriesName
    ? posts
        .filter((post) => post.seriesName === tool.seriesName)
        .sort(
          (left, right) =>
            (left.seriesOrder ?? Number.MAX_SAFE_INTEGER) -
              (right.seriesOrder ?? Number.MAX_SAFE_INTEGER) ||
            left.publishedAt.localeCompare(right.publishedAt),
        )
    : [];
  const newerPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const olderPost =
    currentIndex >= 0 && currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;
  const relatedPosts = posts
    .filter(
      (post) =>
        post.slug !== tool.slug &&
        post.category === tool.category &&
        (!tool.seriesName || post.seriesName !== tool.seriesName),
    )
    .slice(0, 3);
  const articleUrl = absoluteUrl(`/tools/${tool.slug}`);
  const articleImage = absoluteUrl(`/tools/${tool.slug}/opengraph-image`);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: tool.name,
    description: tool.summary,
    image: [articleImage],
    datePublished: tool.publishedAt,
    dateModified: tool.updatedAt,
    articleSection: tool.category,
    ...(tool.seriesName
      ? {
          isPartOf: {
            "@type": "CreativeWorkSeries",
            name: tool.seriesName,
          },
          position: tool.seriesOrder,
        }
      : {}),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    author: {
      "@type": "Organization",
      name: tool.author,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      "@id": absoluteUrl("/#organization"),
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/opengraph-image"),
      },
    },
  };

  return (
    <div className="postPageBackground">
      <article className="container reviewShell">
        <script
          nonce={nonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <header className="reviewHeader reviewHeaderSimple">
          <div>
            <nav className="articleBreadcrumb" aria-label="Breadcrumb">
              <Link href="/tools">Journal</Link>
              <span aria-hidden="true">/</span>
              <Link href={`/categories/${tool.category}`}>
                {tool.category === "general" ? "Analysis" : slugToTitle(tool.category)}
              </Link>
            </nav>
            <h1 id="article-title" title={tool.name}>
              {tool.name}
            </h1>
            <div className="articleMeta">
              <p className="postDate">
                <span className="authorMonogram" aria-hidden="true">
                  SA
                </span>
                <span>
                  <strong>{tool.author}</strong>
                  <span>
                    Published{" "}
                    <time dateTime={tool.publishedAt}>{formatDate(tool.publishedAt)}</time>
                    {tool.updatedAt !== tool.publishedAt
                      ? ` · Updated ${formatDate(tool.updatedAt)}`
                      : ""}
                  </span>
                </span>
              </p>
              <span className="readingTime">{document.readingMinutes} min read</span>
              <ArticleActions />
            </div>
            {tool.seriesName ? (
              <p className="seriesKicker">
                <span>{tool.seriesName}</span>
                {tool.seriesOrder ? ` · Part ${tool.seriesOrder}` : ""}
              </p>
            ) : null}
          </div>
        </header>

        <div className={`readingLayout${document.headings.length > 1 ? " hasToc" : ""}`}>
          {document.headings.length > 1 ? (
            <aside className="readingAside">
              <details className="articleToc" open>
                <summary>
                  On this page <span>{document.headings.length} sections</span>
                </summary>
                <nav aria-label="Table of contents">
                  <ol>
                    {document.headings.map((heading) => (
                      <li
                        key={heading.id}
                        className={heading.depth === 3 ? "tocSubsection" : undefined}
                      >
                        <a
                          href={`#${heading.id}`}
                          dangerouslySetInnerHTML={{ __html: heading.html }}
                        />
                      </li>
                    ))}
                  </ol>
                </nav>
              </details>
              <Link href="/tools" className="readerReturn">
                ← Back to the journal
              </Link>
            </aside>
          ) : null}
          <div className="postBody proseReview">
            <div className="articleContent" dangerouslySetInnerHTML={{ __html: document.html }} />
          </div>
        </div>

        <footer className="postDiscovery">
          {seriesPosts.length > 0 ? (
            <nav className="seriesNavigation" aria-labelledby="series-heading">
              <div className="seriesNavigationHeader">
                <span className="eyebrow">Continue the series</span>
                <h2 id="series-heading">{tool.seriesName}</h2>
              </div>
              <ol>
                {seriesPosts.map((post) => {
                  const isCurrent = post.slug === tool.slug;

                  return (
                    <li key={post.slug} className={isCurrent ? "seriesCurrent" : undefined}>
                      <span>Part {post.seriesOrder}</span>
                      {isCurrent ? (
                        <strong aria-current="page">{post.name}</strong>
                      ) : (
                        <Link href={`/tools/${post.slug}`}>{post.name}</Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          ) : null}

          {(newerPost || olderPost) && (
            <nav className="postPagination" aria-label="More posts">
              <div>
                {newerPost ? (
                  <>
                    <span>Newer post</span>
                    <Link href={`/tools/${newerPost.slug}`}>{newerPost.name}</Link>
                  </>
                ) : null}
              </div>
              <div className="postPaginationOlder">
                {olderPost ? (
                  <>
                    <span>Older post</span>
                    <Link href={`/tools/${olderPost.slug}`}>{olderPost.name}</Link>
                  </>
                ) : null}
              </div>
            </nav>
          )}

          {relatedPosts.length > 0 ? (
            <section className="relatedPosts" aria-labelledby="related-posts-heading">
              <div className="sectionHeading">
                <h2 id="related-posts-heading">Related posts</h2>
                {tool.seriesName ? (
                  <Link
                    href={`/series/${encodeURIComponent(tool.seriesName)}`}
                    className="textLink"
                  >
                    View full series
                  </Link>
                ) : (
                  <Link href={`/categories/${tool.category}`} className="textLink">
                    More in {tool.category === "general" ? "Analysis" : slugToTitle(tool.category)}
                  </Link>
                )}
              </div>
              <div className="cardGrid">
                {relatedPosts.map((post) => (
                  <ToolCard key={post.slug} tool={post} />
                ))}
              </div>
            </section>
          ) : null}

          <div className="postBackLink">
            <Link href="/tools" className="textLink">
              Back to all posts
            </Link>
          </div>
        </footer>
      </article>
    </div>
  );
}
