import { NextResponse } from "next/server";

import { getAllReviewMetaWithStatus } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export async function GET() {
  const { storage } = await getAllReviewMetaWithStatus();
  const healthy = storage.mode === "database" && !storage.error;

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      storage: storage.mode,
      postCount: storage.postCount ?? 0,
      checkedAt: new Date().toISOString()
    },
    {
      status: healthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
