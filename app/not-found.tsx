import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container pageShell">
      <div className="pageIntro">
        <span className="eyebrow">404</span>
        <h1>Page not found</h1>
        <p>The page you requested does not exist. Try heading back to the review library.</p>
        <Link href="/tools" className="primaryButton">
          Browse reviews
        </Link>
      </div>
    </section>
  );
}
