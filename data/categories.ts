import { ToolCategory } from "@/lib/types";

export const categories: Array<{
  slug: ToolCategory;
  name: string;
  description: string;
}> = [
  {
    slug: "general",
    name: "General AI",
    description: "Broad takes on AI trends, workflows, tools, and ideas."
  },
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
];
