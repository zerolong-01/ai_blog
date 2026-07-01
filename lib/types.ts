export type ToolCategory =
  | "writing"
  | "productivity"
  | "design"
  | "video"
  | "developer";

export type ToolReview = {
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
  updatedAt: string;
};
