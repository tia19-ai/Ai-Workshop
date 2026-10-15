import type { Metadata } from "next";
import Link from "next/link";
import CompletedWeeks from "./completed-weeks";

export const metadata: Metadata = {
  title: "Completed · Tia",
};

export default function CompletedPage() {
  return (
    <div className="container">
      <p className="back-link">
        <Link href="/">← Back to my tasks</Link>
      </p>

      <header className="hero">
        <h1>Completed</h1>
        <p className="tagline">What you have finished, week by week.</p>
      </header>

      <main>
        <CompletedWeeks />
      </main>
    </div>
  );
}
