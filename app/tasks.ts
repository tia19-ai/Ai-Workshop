// Reads and saves study tasks in the Supabase "tasks" table over its HTTP API.
// Row level security in Supabase makes sure each user only ever gets their own rows.

import { SUPABASE_KEY, SUPABASE_URL, loadSession } from "./auth";

export const SKILLS = ["Listening", "Speaking", "Reading", "Writing"] as const;
export type Skill = (typeof SKILLS)[number];

export const REPEATS = ["none", "daily", "weekly"] as const;
export type Repeat = (typeof REPEATS)[number];

export type Task = {
  id: string;
  title: string;
  skill: Skill;
  done: boolean;
  repeat: Repeat;
  due_on: string; // a calendar date such as "2026-10-15"
};

const TASK_COLUMNS = "id,title,skill,done,repeat,due_on";

// Sends one request to a Supabase table as the signed-in user. Also used by notes.ts.
export async function dataRequest(
  table: string,
  query: string,
  init: RequestInit = {},
): Promise<Response> {
  // loadSession renews the sign-in if it has expired, so long visits keep working.
  const session = await loadSession();
  if (!session) throw new Error("You have been logged out. Please log in again.");
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Saving is not set up on this site yet.");

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!res.ok) throw new Error(`Could not save or load your ${table}. Please try again.`);
  return res;
}

// Dates are handled as plain "YYYY-MM-DD" strings in the learner's own time zone.
export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function today(): string {
  return toDateString(new Date());
}

// The next date in the pattern that is after today. A weekly task due today comes back
// in 7 days; one that was left for three weeks comes back once, not three times.
export function nextDueDate(dueOn: string, repeat: Repeat): string {
  const step = repeat === "weekly" ? 7 : 1;
  const next = parseDate(dueOn);
  const now = today();
  do {
    next.setDate(next.getDate() + step);
  } while (toDateString(next) <= now);
  return toDateString(next);
}

export async function listTasks(): Promise<Task[]> {
  const res = await dataRequest(
    "tasks",
    `?select=${TASK_COLUMNS}&order=due_on.asc,created_at.asc`,
  );
  return res.json();
}

export async function addTask(title: string, skill: Skill, repeat: Repeat): Promise<Task> {
  const res = await dataRequest("tasks", `?select=${TASK_COLUMNS}`, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ title, skill, repeat, due_on: today() }),
  });
  const rows: Task[] = await res.json();
  return rows[0];
}

export async function setTaskDone(id: string, done: boolean): Promise<void> {
  await dataRequest("tasks", `?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ done }),
  });
}

// Deletes a task for good. Its notes go with it (the database removes them automatically).
// If nothing was deleted, the database refused, so say so rather than pretend it worked.
export async function deleteTask(id: string): Promise<void> {
  const res = await dataRequest("tasks", `?id=eq.${encodeURIComponent(id)}&select=id`, {
    method: "DELETE",
    headers: { Prefer: "return=representation" },
  });
  const rows: { id: string }[] = await res.json();
  if (rows.length === 0) throw new Error("Could not delete that task. Please try again.");
}

// Creates the next copy of a repeating task. The database allows only one copy per task
// (repeats_from is unique), so ticking, unticking and ticking again never makes a second
// copy: the duplicate is ignored and this returns null.
export async function createNextCopy(task: Task): Promise<Task | null> {
  const res = await dataRequest("tasks", `?on_conflict=repeats_from&select=${TASK_COLUMNS}`, {
    method: "POST",
    headers: { Prefer: "return=representation,resolution=ignore-duplicates" },
    body: JSON.stringify({
      title: task.title,
      skill: task.skill,
      repeat: task.repeat,
      due_on: nextDueDate(task.due_on, task.repeat),
      repeats_from: task.id,
    }),
  });
  const rows: Task[] = await res.json();
  return rows[0] ?? null;
}
