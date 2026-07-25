import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.name} — thoughtful writing about AI`;
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          background: "#f7f3ea",
          color: "#1d1b18",
          fontFamily: "Georgia, serif"
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: "-0.02em" }}>{siteConfig.name}</div>
        <div style={{ display: "flex", maxWidth: 920, fontSize: 76, lineHeight: 1.05, letterSpacing: "-0.04em" }}>
          Thoughtful writing about AI.
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 26, color: "#655d54" }}>
          <span>Tools</span>
          <span>·</span>
          <span>Workflows</span>
          <span>·</span>
          <span>Ideas</span>
        </div>
      </div>
    ),
    size
  );
}
