import { ToolReview } from "@/lib/types";

export const categories = [
  {
    slug: "writing",
    name: "AI Writing",
    description: "Copywriting, long-form content, SEO briefs, and editing assistants."
  },
  {
    slug: "productivity",
    name: "Productivity",
    description: "Meeting notes, search, workflow automation, and everyday knowledge work."
  },
  {
    slug: "design",
    name: "Design",
    description: "Image generation, brand assets, presentations, and creative concepting."
  },
  {
    slug: "video",
    name: "Video",
    description: "Script-to-video, editing, captioning, voiceover, and social clips."
  },
  {
    slug: "developer",
    name: "Developer Tools",
    description: "Coding copilots, debugging tools, API assistants, and agent workflows."
  }
] as const;

export const tools: ToolReview[] = [
  {
    slug: "jasper-ai",
    name: "Jasper",
    tagline: "Brand-aware AI writing for marketing teams.",
    category: "writing",
    website: "https://www.jasper.ai",
    price: "Paid plans from $39/month",
    rating: 4.5,
    summary:
      "Jasper is strongest when a team needs structured workflows, reusable brand voice, and campaign execution at scale.",
    bestFor: ["Marketing teams", "Brand voice consistency", "Landing page copy"],
    pros: [
      "Strong template library for campaigns",
      "Brand voice controls are better than most general assistants",
      "Useful collaboration features for teams"
    ],
    cons: [
      "Pricing climbs quickly for solo creators",
      "Output still needs fact-checking for expert topics",
      "Less flexible than open-ended chat-first tools"
    ],
    features: [
      "Brand voice memory",
      "Campaign workflows",
      "Team collaboration",
      "SEO-oriented content generation"
    ],
    verdict:
      "A polished choice for teams that care more about consistency and workflow than raw experimentation.",
    updatedAt: "2026-06-20"
  },
  {
    slug: "notion-ai",
    name: "Notion AI",
    tagline: "AI inside your docs, notes, and team workspace.",
    category: "productivity",
    website: "https://www.notion.so/product/ai",
    price: "Available as a Notion add-on or included in some plans",
    rating: 4.4,
    summary:
      "Notion AI works best when you already live in Notion and want search, drafting, summaries, and project support without context switching.",
    bestFor: ["Internal documentation", "Meeting recaps", "Workspace search"],
    pros: [
      "Native fit for existing Notion users",
      "Good at summarizing messy notes quickly",
      "Useful workspace-aware search experience"
    ],
    cons: [
      "Less compelling if your team does not use Notion heavily",
      "AI results depend on how well the workspace is organized",
      "Advanced automation often needs extra tooling"
    ],
    features: [
      "Document drafting",
      "Workspace Q&A",
      "Meeting summaries",
      "Database support"
    ],
    verdict:
      "One of the highest-leverage AI upgrades for teams already invested in Notion.",
    updatedAt: "2026-06-18"
  },
  {
    slug: "midjourney",
    name: "Midjourney",
    tagline: "Distinctive AI image generation with strong aesthetic output.",
    category: "design",
    website: "https://www.midjourney.com",
    price: "Paid plans from $10/month",
    rating: 4.7,
    summary:
      "Midjourney still stands out for mood, texture, and art direction, especially for concept generation and visual exploration.",
    bestFor: ["Concept art", "Moodboards", "Brand visual exploration"],
    pros: [
      "Excellent visual taste out of the box",
      "Strong community prompting patterns",
      "High-quality detail and composition"
    ],
    cons: [
      "Interface may feel less straightforward to mainstream teams",
      "Fine-grained commercial workflow control can be limited",
      "Not ideal when you need strict template consistency"
    ],
    features: [
      "High-style image generation",
      "Variations and upscaling",
      "Prompt-based art direction",
      "Community-driven exploration"
    ],
    verdict:
      "A top pick when image quality and artistic feel matter more than conventional workflow UX.",
    updatedAt: "2026-06-16"
  },
  {
    slug: "runway",
    name: "Runway",
    tagline: "AI video creation and editing for fast-moving creative teams.",
    category: "video",
    website: "https://runwayml.com",
    price: "Free tier plus paid plans",
    rating: 4.3,
    summary:
      "Runway is a practical choice for teams creating short-form video, experiments, and lightweight motion assets without a heavyweight editing pipeline.",
    bestFor: ["Short-form video", "Creative experiments", "Motion asset generation"],
    pros: [
      "Wide feature breadth for video workflows",
      "Fast iteration for social content",
      "Good entry point for non-expert editors"
    ],
    cons: [
      "Credits can disappear fast during experimentation",
      "Quality varies by task",
      "Enterprise production teams may outgrow it"
    ],
    features: [
      "Text-to-video",
      "Video editing tools",
      "Background removal",
      "Generative motion effects"
    ],
    verdict:
      "Best for agile creative teams that value speed and experimentation over polished studio control.",
    updatedAt: "2026-06-14"
  },
  {
    slug: "cursor",
    name: "Cursor",
    tagline: "An AI-first coding environment for shipping faster.",
    category: "developer",
    website: "https://www.cursor.com",
    price: "Free tier plus paid plans",
    rating: 4.6,
    summary:
      "Cursor is one of the most compelling AI coding tools for developers who want fast edits, repo-aware assistance, and a chat-driven coding loop.",
    bestFor: ["Software engineers", "Codebase navigation", "Rapid implementation"],
    pros: [
      "Strong repo context and editing loop",
      "Useful for both greenfield and maintenance work",
      "Feels faster than juggling multiple separate tools"
    ],
    cons: [
      "Heavy users can become over-reliant on generated code",
      "Quality still depends on good prompts and review discipline",
      "Team governance features vary by plan"
    ],
    features: [
      "Repo-aware chat",
      "Inline code generation",
      "AI-assisted refactoring",
      "Multi-file edits"
    ],
    verdict:
      "A standout choice for developers who want their editor to behave more like an active coding partner.",
    updatedAt: "2026-06-22"
  }
];

export function getToolBySlug(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(category: string) {
  return tools.filter((tool) => tool.category === category);
}
