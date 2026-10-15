// Reads finished tasks grouped by week. The grouping happens inside Supabase, in the
// completed_by_week function, so one row per week comes back with its count and its tasks.
// That function runs as the signed-in user, so row level security still limits it to their own tasks.

import { Skill, dataRequest, parseDate, toDateString, today } from "./tasks";

export type CompletedTask = {
  id: string;
  title: string;
  skill: Skill;
  completed_at: string;
};

export type CompletedWeek = {
  week_start: string; // the Monday that starts the week, such as "2026-10-12"
  finished: number;
  tasks: CompletedTask[];
};

export async function listCompletedWeeks(): Promise<CompletedWeek[]> {
  // Weeks are cut in the learner's own time zone, so a task ticked late on Sunday stays in that week.
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const res = await dataRequest("rpc/completed_by_week", "", {
    method: "POST",
    body: JSON.stringify({ tz }),
  });
  return res.json();
}

// The Monday of the current week, in the same "YYYY-MM-DD" form the database sends back.
export function thisWeekStart(): string {
  const date = parseDate(today());
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return toDateString(date);
}
