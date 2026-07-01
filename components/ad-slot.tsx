"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdSlotProps = {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal";
  label?: string;
};

const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export function AdSlot({ slot, format = "auto", label = "Sponsored" }: AdSlotProps) {
  useEffect(() => {
    if (!client) return;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // Ignore duplicate requests during fast refresh.
    }
  }, []);

  if (!client) {
    return (
      <div className="adPlaceholder" aria-label="Advertisement placeholder">
        <span>{label}</span>
        <strong>Ad slot ready for AdSense</strong>
      </div>
    );
  }

  return (
    <div className="adFrame">
      <span className="adLabel">{label}</span>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
