type DraftValues = Record<string, string>;
type StorageAccess = () => Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type DraftStatus = "empty" | "saved" | "restored" | "unavailable";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function createEditorDraftStore<T extends DraftValues>(
  key: string,
  initialValues: T,
  storage: StorageAccess = () => window.localStorage
) {
  const initialSnapshot = { values: initialValues, status: "empty" as DraftStatus };
  let snapshot = initialSnapshot;
  let loaded = false;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());

  function restore() {
    if (loaded) return;
    loaded = true;
    try {
      const raw = storage().getItem(key);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (
        draft?.version !== 1 || !Number.isFinite(draft.savedAt) ||
        Date.now() - draft.savedAt > MAX_AGE_MS ||
        !draft.values || typeof draft.values !== "object" ||
        !Object.keys(initialValues).every((field) => typeof draft.values[field] === "string")
      ) {
        storage().removeItem(key);
        return;
      }
      const values = Object.fromEntries(Object.keys(initialValues).map((field) => [field, draft.values[field]])) as T;
      snapshot = { values, status: "restored" };
    } catch {
      snapshot = { ...snapshot, status: "unavailable" };
    }
  }

  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => initialSnapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      restore();
      return () => { listeners.delete(listener); };
    },
    setValues(update: T | ((previous: T) => T)) {
      const values = typeof update === "function" ? update(snapshot.values) : update;
      let status: DraftStatus = "saved";
      try {
        storage().setItem(key, JSON.stringify({ version: 1, values, savedAt: Date.now() }));
      } catch {
        status = "unavailable";
      }
      snapshot = { values, status };
      notify();
    },
    clear() {
      let status: DraftStatus = "empty";
      try { storage().removeItem(key); } catch { status = "unavailable"; }
      snapshot = { values: initialValues, status };
      notify();
    }
  };
}
