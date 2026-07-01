import Link from "next/link";

import { ToolReviewMeta } from "@/lib/types";

type ToolCardProps = {
  tool: ToolReviewMeta;
};

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <article className="toolCard">
      <div className="toolCardTop">
        <span className="pill">{tool.category}</span>
        <span className="rating">{tool.rating.toFixed(1)} / 5</span>
      </div>
      <h3>{tool.name}</h3>
      <p className="tagline">{tool.tagline}</p>
      <p>{tool.summary}</p>
      <div className="metaRow">
        <span>{tool.price}</span>
      </div>
      <Link href={`/tools/${tool.slug}`} className="textLink">
        Read full review
      </Link>
    </article>
  );
}
