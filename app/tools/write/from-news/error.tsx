"use client";

import { useEffect } from "react";

export default function NewsDraftError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("News draft page error", error.digest); }, [error]);
  return (
    <section className="container pageShell writePageShell">
      <div className="writeMain writeMainSolo">
        <div className="storageNotice storageNoticeError" role="alert">
          <strong>News draft tools are temporarily unavailable</strong>
          <span>Please retry. If this continues, apply the latest database migrations and verify the OpenAI environment settings.</span>
          {error.digest ? <code>Reference: {error.digest}</code> : null}
        </div>
        <button type="button" className="primaryButton" onClick={reset}>Try again</button>
      </div>
    </section>
  );
}
