import Link from "next/link";

import { ToolReviewMeta } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { UiIcon } from "@/components/ui-icon";
import { categories } from "@/data/categories";

type ToolCardProps = {
  tool: ToolReviewMeta;
};

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link href={`/tools/${tool.slug}`} className="toolCard" aria-label={tool.name}>
      <div className="toolCardTop">
        <span className="pill">
          {tool.category === "general"
            ? "Analysis"
            : categories.find((category) => category.slug === tool.category)?.name || tool.category}
        </span>
        <UiIcon name="arrow" className="cardArrow" />
      </div>
      <h3>{tool.name}</h3>
      <p>{tool.summary}</p>
      <div className="cardFooter">
        <time dateTime={tool.updatedAt}>{formatDate(tool.updatedAt)}</time>
        <span>Read story</span>
      </div>
    </Link>
  );
}
