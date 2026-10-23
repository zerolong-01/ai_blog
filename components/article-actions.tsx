"use client";

import { useState } from "react";
import { UiIcon } from "@/components/ui-icon";

export function ArticleActions() {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }
  return (
    <div className="articleActions">
      <button type="button" className="copyLinkButton" onClick={copyLink}>
        <UiIcon name="link" />
        {status === "copied" ? "Link copied" : "Copy link"}
      </button>
      <span className={status === "failed" ? "copyLinkError" : "srOnly"} role="status">
        {status === "copied"
          ? "Article link copied to clipboard."
          : status === "failed"
            ? "Copy the article address from your browser’s address bar."
            : ""}
      </span>
    </div>
  );
}
