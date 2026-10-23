import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

test("installed React and React DOM can render together", () => {
  assert.equal(renderToString(createElement("p", null, "Runtime ready")), "<p>Runtime ready</p>");
});
