"use client";

import { useMemo, useSyncExternalStore } from "react";
import { createEditorDraftStore } from "@/lib/editor-draft-store";

export function useEditorDraft<T extends Record<string, string>>(key: string, initialValues: T) {
  const initialJson = JSON.stringify(initialValues);
  const store = useMemo(
    () => createEditorDraftStore<T>(`stacked-ai:editor:${key}`, JSON.parse(initialJson)),
    [key, initialJson]
  );
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return { ...snapshot, setValues: store.setValues, clearDraft: store.clear };
}
