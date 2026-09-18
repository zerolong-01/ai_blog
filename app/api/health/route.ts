import { NextResponse } from "next/server";

import { checkPostDatabase } from "@/lib/posts-db";

export const dynamic = "force-dynamic";

export async function GET() {
  let healthy = false;
  let postCount = 0;
  try { postCount = await checkPostDatabase(); healthy = true; } catch {}


  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      storage: healthy ? "database" : "unavailable",
      postCount,
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
