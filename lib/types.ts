export type ToolCategory =
  | "general"
  | "writing"
  | "productivity"
  | "design"
  | "video"
  | "developer";

export type ToolReviewMeta = {
  slug: string;
  name: string;
  tagline: string;
  category: ToolCategory;
  website: string;
  price: string;
  rating: number;
  summary: string;
  bestFor: string[];
  pros: string[];
  cons: string[];
  features: string[];
  verdict: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  seriesName?: string;
  seriesOrder?: number;
};

export type ToolReview = ToolReviewMeta & {
  content: string;
};
