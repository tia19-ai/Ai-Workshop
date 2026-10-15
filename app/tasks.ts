// Reads and saves study tasks in the Supabase "tasks" table over its HTTP API.
// Row level security in Supabase makes sure each user only ever gets their own rows.

import { SUPABASE_KEY, SUPABASE_URL, loadSession } from "./auth";

export const SKILLS = ["Listening", "Speaking", "Reading", "Writing"] as const;
export type Skill = (typeof SKILLS)[number];

export type Task = {
  id: string;
  title: string;
  skill: Skill;
  done: boolean;
};

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

export async function listTasks(): Promise<Task[]> {
  const res = await dataRequest("tasks", "?select=id,title,skill,done&order=created_at.asc");
  return res.json();
}

export async function addTask(title: string, skill: Skill): Promise<Task> {
  const res = await dataRequest("tasks", "?select=id,title,skill,done", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ title, skill }),
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
