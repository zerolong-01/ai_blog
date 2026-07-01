export const siteConfig = {
  name: "Stacked AI",
  shortName: "Stacked AI",
  description:
    "A clean editorial blog covering AI tools, workflows, ideas, and the shifts shaping how people work.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://toolaiatlas.com",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@toolaiatlas.com",
  locale: "en_US",
  creator: "Stacked AI",
  keywords: [
    "AI blog",
    "artificial intelligence",
    "AI tools",
    "AI workflows",
    "AI writing",
    "AI productivity"
  ]
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
