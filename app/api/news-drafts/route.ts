import { NextResponse } from "next/server";

import { requireAdminAuth } from "@/lib/admin-auth";
import { generateNewsDraft, type GenerateNewsDraftResult } from "@/lib/generate-news-draft";

export const runtime = "nodejs";
export const maxDuration = 75;

function failure(message: string, status: number, requestId: string) {
  return NextResponse.json<GenerateNewsDraftResult & { requestId: string }>(
    { ok: false, code: "AI_FAILED", message, requestId },
    { status }
  );
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    await requireAdminAuth();
  } catch {
    return failure("Your admin session has expired. Sign in again and retry.", 401, requestId);
  }

  try {
    const formData = await request.formData();
    const sourceUrl = String(formData.get("sourceUrl") || "").trim();
    const sourceText = String(formData.get("sourceText") || "").trim();
    const result = await generateNewsDraft(sourceUrl, sourceText);
    return NextResponse.json({ ...result, requestId }, { status: result.ok ? 200 : 422 });
  } catch (error) {
    console.error("[news-draft-api]", { requestId, message: error instanceof Error ? error.message : String(error) });
    return failure("News draft generation failed unexpectedly. Please retry or contact the administrator with the reference below.", 500, requestId);
  }
}
