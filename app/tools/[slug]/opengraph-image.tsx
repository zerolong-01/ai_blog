import { ImageResponse } from "next/og";

import { getReviewBySlug } from "@/lib/reviews";
import { siteConfig } from "@/lib/site";
import { slugToTitle } from "@/lib/utils";

export const alt = "Stacked AI article";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default async function ArticleOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getReviewBySlug(slug);
  const title = post?.name || slugToTitle(slug);
  const category = post?.category || "AI";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#171818",
          color: "#f4efe4",
          fontFamily: "Georgia, serif"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28 }}>
          <span>{siteConfig.name}</span>
          <span style={{ color: "#61d164", textTransform: "uppercase" }}>{category}</span>
        </div>
        <div style={{ display: "flex", maxWidth: 1040, fontSize: 72, lineHeight: 1.06, letterSpacing: "-0.04em" }}>
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#c0b5a6" }}>Independent AI writing</div>
      </div>
    ),
    size
  );
}
