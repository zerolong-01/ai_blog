import { revalidatePath, revalidateTag } from "next/cache";

export function invalidatePublicPosts(slug: string) {
  revalidateTag("posts", { expire: 0 });
  for (const path of ["/", "/admin", "/admin/history", "/tools", "/search", "/categories", "/series", "/sitemap.xml", "/rss.xml", `/tools/${slug}`]) revalidatePath(path);
  revalidatePath("/categories/[slug]", "page");
  revalidatePath("/series/[name]", "page");
}
