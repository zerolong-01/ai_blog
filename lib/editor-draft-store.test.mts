import assert from "node:assert/strict";
import test from "node:test";
import { createEditorDraftStore } from "./editor-draft-store.ts";

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value); },
    removeItem: (key: string) => { data.delete(key); }
  };
}
const empty = { title: "", content: "", series: "" };

test("restores every field after reload and keeps the server snapshot empty", () => {
  const storage = memoryStorage();
  const first = createEditorDraftStore("create", empty, () => storage);
  const values = { title: "보안 소식", content: "본문", series: "보안" };
  first.setValues(values);
  const reloaded = createEditorDraftStore("create", empty, () => storage);
  assert.deepEqual(reloaded.getServerSnapshot().values, empty);
  reloaded.subscribe(() => {});
  assert.deepEqual(reloaded.getSnapshot(), { values, status: "restored" });
});

test("isolates editor modes and individual posts; clears only the successful draft", () => {
  const storage = memoryStorage();
  const create = createEditorDraftStore("create", empty, () => storage);
  const edit = createEditorDraftStore("edit:existing", empty, () => storage);
  create.setValues({ ...empty, title: "새 글" });
  edit.setValues({ ...empty, title: "수정" });
  edit.clear();
  assert.equal(storage.getItem("edit:existing"), null);
  const restored = createEditorDraftStore("create", empty, () => storage);
  restored.subscribe(() => {});
  assert.equal(restored.getSnapshot().values.title, "새 글");
});

test("keeps live input when browser storage is denied or full", () => {
  const unavailable = () => { throw new Error("denied"); };
  const store = createEditorDraftStore("create", empty, unavailable);
  store.subscribe(() => {});
  store.setValues({ ...empty, content: "유지할 작성 내용" });
  assert.equal(store.getSnapshot().values.content, "유지할 작성 내용");
  assert.equal(store.getSnapshot().status, "unavailable");
});

test("ignores incompatible and expired drafts without overwriting imported content", () => {
  const storage = memoryStorage();
  for (const draft of [
    { version: 1, savedAt: Date.now(), values: { title: 12 } },
    { version: 1, savedAt: 0, values: empty },
    { version: 2, savedAt: Date.now(), values: empty }
  ]) {
    storage.setItem("news:1", JSON.stringify(draft));
    const initial = { ...empty, content: "imported" };
    const store = createEditorDraftStore("news:1", initial, () => storage);
    store.subscribe(() => {});
    assert.deepEqual(store.getSnapshot().values, initial);
    assert.equal(storage.getItem("news:1"), null);
  }
});

test("functional edits use the latest values and notify subscribers", () => {
  const storage = memoryStorage();
  const store = createEditorDraftStore("create", empty, () => storage);
  let notifications = 0;
  const unsubscribe = store.subscribe(() => { notifications += 1; });
  store.setValues((current) => ({ ...current, title: "title" }));
  store.setValues((current) => ({ ...current, content: "content" }));
  assert.deepEqual(store.getSnapshot().values, { ...empty, title: "title", content: "content" });
  assert.equal(notifications, 2);
  unsubscribe();
  store.clear();
  assert.equal(notifications, 2);
});
