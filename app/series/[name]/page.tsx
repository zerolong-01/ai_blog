import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ToolCard } from "@/components/tool-card";
import { getReviewsBySeries } from "@/lib/reviews";
import { absoluteUrl } from "@/lib/site";

type SeriesDetailPageProps = {
  params: Promise<{ name: string }>;
};

export const dynamic = "force-dynamic";

function getSeriesName(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateMetadata({ params }: SeriesDetailPageProps): Promise<Metadata> {
  const { name } = await params;
  const seriesName = getSeriesName(name);

  return {
    title: `${seriesName} Series`,
    description: `Read every article in the ${seriesName} series in order.`,
    alternates: {
      canonical: absoluteUrl(`/series/${encodeURIComponent(seriesName)}`)
    }
  };
}

export default async function SeriesDetailPage({ params }: SeriesDetailPageProps) {
  const { name } = await params;
  const seriesName = getSeriesName(name);
  const posts = await getReviewsBySeries(seriesName);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <section className="container pageShell">
      <div className="pageIntro">
        <span className="eyebrow">Series · {posts.length} {posts.length === 1 ? "part" : "parts"}</span>
        <h1>{seriesName}</h1>
        <p>Read this collection in order or continue from where you left off.</p>
      </div>

      <ol className="seriesCardList">
        {posts.map((post) => (
          <li key={post.slug}>
            <span className="seriesPartNumber">Part {post.seriesOrder}</span>
            <ToolCard tool={post} />
          </li>
        ))}
      </ol>

      <div className="postBackLink">
        <Link href="/series" className="textLink">
          Back to all series
        </Link>
      </div>
    </section>
  );
}
