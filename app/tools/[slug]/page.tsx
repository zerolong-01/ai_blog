import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

import { ToolCard } from "@/components/tool-card";
import { renderMarkdown } from "@/lib/markdown";
import { getAllReviewMeta, getReviewBySlug } from "@/lib/reviews";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { formatDate, slugToTitle } from "@/lib/utils";

type ToolPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getReviewBySlug(slug);

  if (!tool) {
    return {
      title: slugToTitle(slug)
    };
  }

  return {
    title: tool.name,
    description: tool.summary,
    alternates: {
      canonical: absoluteUrl(`/tools/${tool.slug}`)
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
          alt: tool.name
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: tool.name,
      description: tool.summary,
      images: [absoluteUrl(`/tools/${tool.slug}/opengraph-image`)]
    }
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const nonce = (await headers()).get("x-nonce") || undefined;
  const [tool, posts] = await Promise.all([getReviewBySlug(slug), getAllReviewMeta()]);

  if (!tool) {
    notFound();
  }

  const reviewContent = await renderMarkdown(tool.content);
  const currentIndex = posts.findIndex((post) => post.slug === tool.slug);
  const seriesPosts = tool.seriesName
    ? posts
        .filter((post) => post.seriesName === tool.seriesName)
        .sort(
          (left, right) =>
            (left.seriesOrder ?? Number.MAX_SAFE_INTEGER) - (right.seriesOrder ?? Number.MAX_SAFE_INTEGER) ||
            left.publishedAt.localeCompare(right.publishedAt)
        )
    : [];
  const newerPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const olderPost = currentIndex >= 0 && currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;
  const relatedPosts = posts
    .filter(
      (post) =>
        post.slug !== tool.slug && post.category === tool.category && (!tool.seriesName || post.seriesName !== tool.seriesName)
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
            name: tool.seriesName
          },
          position: tool.seriesOrder
        }
      : {}),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl
    },
    author: {
      "@type": "Organization",
      name: tool.author,
      url: siteConfig.url
    },
    publisher: {
      "@type": "Organization",
      "@id": absoluteUrl("/#organization"),
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/opengraph-image")
      }
    }
  };

  return (
    <article className="container reviewShell">
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="reviewHeader reviewHeaderSimple">
        <div>
          <span className="eyebrow">AI blog</span>
          <h1>{tool.name}</h1>
          <p className="postDate">
            By {tool.author} · Published {formatDate(tool.publishedAt)}
            {tool.updatedAt !== tool.publishedAt ? ` · Updated ${formatDate(tool.updatedAt)}` : ""}
          </p>
          {tool.seriesName ? (
            <p className="seriesKicker">
              <span>{tool.seriesName}</span>
              {tool.seriesOrder ? ` · Part ${tool.seriesOrder}` : ""}
            </p>
          ) : null}
        </div>
      </header>

      <div className="postBody proseReview">
        <div dangerouslySetInnerHTML={{ __html: reviewContent }} />
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
              <Link href={`/categories/${tool.category}`} className="textLink">
                More in {tool.category}
              </Link>
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
  );
}
