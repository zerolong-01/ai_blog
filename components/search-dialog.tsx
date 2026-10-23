"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { UiIcon } from "@/components/ui-icon";

export function SearchDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  const openSearch = useCallback(() => {
    if (!dialogRef.current?.open) dialogRef.current?.showModal();
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      const editing =
        target instanceof HTMLElement &&
        (target.isContentEditable || !!target.closest("input, textarea, select, [role='textbox']"));
      if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey && !editing) {
        event.preventDefault();
        openSearch();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openSearch]);

  return (
    <>
      <button
        type="button"
        className="searchTrigger"
        onClick={openSearch}
        aria-label="Search articles"
        aria-haspopup="dialog"
        aria-keyshortcuts="/"
      >
        <UiIcon name="search" />
        <span>Search articles</span>
        <kbd>/</kbd>
      </button>
      <dialog
        ref={dialogRef}
        className="searchDialog"
        aria-labelledby="quick-search-title"
        aria-describedby="quick-search-description"
        onKeyDown={(event) => {
          if (event.key === "Escape") event.stopPropagation();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const bounds = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < bounds.left ||
              event.clientX > bounds.right ||
              event.clientY < bounds.top ||
              event.clientY > bounds.bottom
            )
              event.currentTarget.close();
          }
        }}
      >
        <div className="searchDialogHeader">
          <div>
            <span className="eyebrow">Find your next read</span>
            <h2 id="quick-search-title">What are you curious about?</h2>
          </div>
          <button
            type="button"
            className="iconButton"
            aria-label="Close search"
            onClick={() => dialogRef.current?.close()}
          >
            <UiIcon name="close" />
          </button>
        </div>
        <p id="quick-search-description">Search articles by title, summary, or topic.</p>
        <form action="/search" className="quickSearchForm">
          <label className="srOnly" htmlFor="quick-search">
            Search articles
          </label>
          <UiIcon name="search" />
          <input
            ref={inputRef}
            id="quick-search"
            name="q"
            type="search"
            maxLength={200}
            placeholder="AI, security, coding tools…"
            required
          />
          <button type="submit" className="primaryButton">
            Search
          </button>
        </form>
        <div className="searchSuggestions">
          <span>Explore a topic</span>
          {["AI", "security", "coding"].map((topic) => (
            <Link
              key={topic}
              href={{ pathname: "/search", query: { q: topic } }}
              onClick={() => dialogRef.current?.close()}
            >
              {topic}
              <UiIcon name="arrow" />
            </Link>
          ))}
        </div>
        <p className="searchDialogHint">
          <kbd>Esc</kbd> to close{" "}
          <span>
            <kbd>↵</kbd> to search
          </span>
        </p>
      </dialog>
    </>
  );
}
