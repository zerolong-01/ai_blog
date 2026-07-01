export const siteConfig = {
  name: "Stacked AI Reviews",
  shortName: "Stacked AI",
  description:
    "Independent reviews of the best AI tools for writing, design, coding, video, and productivity.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.example.com",
  locale: "en_US",
  creator: "Stacked AI Reviews",
  keywords: [
    "AI tools reviews",
    "best AI tools",
    "AI writing tools",
    "AI productivity apps",
    "AI software reviews",
    "AI tool comparisons"
  ]
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
