"use client";

import { FormEvent, useEffect, useState } from "react";
import { Note, addNote, listNotes } from "./notes";

// The notes thread for one open task: the notes so far, oldest first, and a box to add another.
export default function TaskNotes({ taskId }: { taskId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listNotes(taskId)
      .then(setNotes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [taskId]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const note = await addNote(taskId, body.trim());
      setNotes((current) => [...current, note]);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="task-notes">
      {loading ? (
        <p className="muted">Loading notes…</p>
      ) : notes.length === 0 ? (
        <p className="muted">No notes yet.</p>
      ) : (
        <ul className="note-list">
          {notes.map((note) => (
            <li key={note.id}>
              <span className="note-time">{new Date(note.created_at).toLocaleString()}</span>
              <p>{note.body}</p>
            </li>
          ))}
        </ul>
      )}

      <form className="note-form" onSubmit={handleAdd}>
        <label>
          Add a note
          <textarea
            required
            maxLength={2000}
            rows={2}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </label>
        <button type="submit" disabled={busy || !body.trim()}>
          {busy ? "Adding…" : "Add note"}
        </button>
      </form>

      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
