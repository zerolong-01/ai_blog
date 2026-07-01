"use client";

import { useMemo, useState } from "react";

import { ToolCard } from "@/components/tool-card";
import { ToolReviewMeta } from "@/lib/types";

type SearchPanelProps = {
  tools: ToolReviewMeta[];
};

export function SearchPanel({ tools }: SearchPanelProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) return tools;

    return tools.filter((tool) => {
      const haystack = [
        tool.name,
        tool.tagline,
        tool.summary,
        tool.category,
        tool.bestFor.join(" "),
        tool.features.join(" ")
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [query, tools]);

  return (
    <div className="searchShell">
      <label className="searchLabel" htmlFor="tool-search">
        Search by title, summary, or category
      </label>
      <input
        id="tool-search"
        className="searchInput"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Try: agents, writing, image generation..."
      />

      <p className="searchCount">{results.length} result(s)</p>

      <div className="cardGrid">
        {results.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}
