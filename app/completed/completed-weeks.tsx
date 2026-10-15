"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadSession } from "../auth";
import { CompletedWeek, listCompletedWeeks, thisWeekStart } from "../completed";
import { parseDate } from "../tasks";

function weekLabel(weekStart: string, current: string): string {
  if (weekStart === current) return "This week";
  const lastWeek = parseDate(current);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const start = parseDate(weekStart);
  if (start.getTime() === lastWeek.getTime()) return "Last week";
  const sameYear = start.getFullYear() === lastWeek.getFullYear();
  return `Week of ${start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  })}`;
}

function finishedOn(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

type State =
  | { kind: "loading" }
  | { kind: "signed-out" }
  | { kind: "failed" }
  | { kind: "ready"; weeks: CompletedWeek[] };

export default function CompletedWeeks() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    loadSession().then(async (session) => {
      if (!session) {
        setState({ kind: "signed-out" });
        return;
      }
      try {
        setState({ kind: "ready", weeks: await listCompletedWeeks() });
      } catch {
        setState({ kind: "failed" });
      }
    });
  }, []);

  if (state.kind === "loading") return <p className="muted">Loading what you have finished…</p>;

  if (state.kind === "signed-out") {
    return (
      <p className="muted">
        <Link href="/">Log in</Link> to see what you have finished.
      </p>
    );
  }

  if (state.kind === "failed") {
    return (
      <p className="auth-error" role="alert">
        Could not load your finished tasks. Please try again.
      </p>
    );
  }

  // This week always shows, even with nothing in it yet, so the count reads 0 rather than vanishing.
  const current = thisWeekStart();
  const weeks = state.weeks.some((w) => w.week_start === current)
    ? state.weeks
    : [{ week_start: current, finished: 0, tasks: [] }, ...state.weeks];

  return (
    <>
      {weeks.map((week) => (
        <section key={week.week_start} className="week" aria-label={weekLabel(week.week_start, current)}>
          <div className="week-header">
            <h2>{weekLabel(week.week_start, current)}</h2>
            <span className="week-count" aria-label={`${week.finished} finished`}>
              {week.finished}
            </span>
          </div>
          {week.tasks.length === 0 ? (
            <p className="muted">Nothing finished yet</p>
          ) : (
            <ul className="week-tasks">
              {week.tasks.map((task) => (
                <li key={task.id}>
                  <span>
                    <span className="task-title">{task.title}</span>
                    <span className="task-meta">Finished {finishedOn(task.completed_at)}</span>
                  </span>
                  <span className="skill-tag">{task.skill}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </>
  );
}
