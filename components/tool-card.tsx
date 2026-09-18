import Link from "next/link";

import { ToolReviewMeta } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type ToolCardProps = {
  tool: ToolReviewMeta;
};

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link href={`/tools/${tool.slug}`} className="toolCard" aria-label={tool.name}>
      <div className="toolCardTop">
        <span className="pill">{tool.category}</span>
        <span className="rating">{formatDate(tool.updatedAt)}</span>
      </div>
      <h3>{tool.name}</h3>
      {tool.tagline ? <p className="tagline">{tool.tagline}</p> : null}
      <p>{tool.summary}</p>
      <span className="textLink">
        Read article <span aria-hidden="true">↗</span>
      </span>
    </Link>
  );
}
