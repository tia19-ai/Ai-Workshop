// Reads and saves notes in the Supabase "notes" table. Each note belongs to one task.
// Row level security only lets a user touch notes whose task is their own.

import { dataRequest } from "./tasks";

export type Note = {
  id: string;
  body: string;
  created_at: string;
};

export async function listNotes(taskId: string): Promise<Note[]> {
  const res = await dataRequest(
    "notes",
    `?select=id,body,created_at&task_id=eq.${encodeURIComponent(taskId)}&order=created_at.asc`,
  );
  return res.json();
}

export async function addNote(taskId: string, body: string): Promise<Note> {
  const res = await dataRequest("notes", "?select=id,body,created_at", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ task_id: taskId, body }),
  });
  const rows: Note[] = await res.json();
  return rows[0];
}
