import assert from "node:assert/strict";
import test from "node:test";

import { buildSeriesContext, resolveSeriesAssignment } from "./series-assignment.ts";

test("builds the next order for existing series", () => {
  const context = buildSeriesContext([
    { slug: "a", name: "A", tagline: "", category: "general", website: "", price: "", rating: 0, summary: "First", bestFor: [], pros: [], cons: [], features: [], verdict: "", author: "A", publishedAt: "2026-01-01", updatedAt: "2026-01-01", seriesName: "AI Agents", seriesOrder: 1 },
    { slug: "b", name: "B", tagline: "", category: "general", website: "", price: "", rating: 0, summary: "Second", bestFor: [], pros: [], cons: [], features: [], verdict: "", author: "A", publishedAt: "2026-01-02", updatedAt: "2026-01-02", seriesName: "AI Agents", seriesOrder: 3 }
  ]);
  assert.deepEqual(context, [{ name: "AI Agents", description: "First", postCount: 2, nextOrder: 4 }]);
});

test("matches an existing theme without changing its canonical name", () => {
  assert.deepEqual(resolveSeriesAssignment(" ai-agents ", [{ name: "AI Agents", description: "", postCount: 2, nextOrder: 4 }]), { name: "AI Agents", order: 4, isNew: false });
});

test("creates the first part of a new reusable theme", () => {
  assert.deepEqual(resolveSeriesAssignment("AI Infrastructure", []), { name: "AI Infrastructure", order: 1, isNew: true });
});
