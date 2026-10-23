export const siteConfig = {
  name: "Stacked AI",
  shortName: "Stacked AI",
  description:
    "Independent perspectives on AI, cybersecurity, and the technology shaping how we work and stay secure.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://toolaiatlas.com",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@toolaiatlas.com",
  googleSiteVerification: process.env.GOOGLE_SITE_VERIFICATION || "",
  locale: "en_US",
  creator: "Stacked AI",
  keywords: [
    "AI blog",
    "artificial intelligence",
    "AI tools",
    "AI workflows",
    "AI writing",
    "AI productivity",
    "cybersecurity",
    "data protection"
  ]
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
