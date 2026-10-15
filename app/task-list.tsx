"use client";

import { FormEvent, useEffect, useState } from "react";
import SkillBalance from "./skill-balance";
import TaskNotes from "./task-notes";
import {
  REPEATS,
  Repeat,
  SKILLS,
  Skill,
  Task,
  addTask,
  createNextCopy,
  deleteTask,
  listTasks,
  parseDate,
  setTaskDone,
} from "./tasks";

const REPEAT_LABELS: Record<Repeat, string> = {
  none: "Does not repeat",
  daily: "Daily",
  weekly: "Weekly",
};

// Earliest due date first; tasks due the same day keep the order they were added in.
function byDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => a.due_on.localeCompare(b.due_on));
}

function formatDate(value: string): string {
  return parseDate(value).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [skill, setSkill] = useState<Skill | "">("");
  const [repeat, setRepeat] = useState<Repeat>("none");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    listTasks()
      .then((rows) => setTasks(byDueDate(rows)))
      .catch((err) => {
        setError(err.message);
        setLoadFailed(true);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!skill) return;
    setBusy(true);
    setError("");
    try {
      const task = await addTask(title.trim(), skill, repeat);
      setTasks((current) => byDueDate([...current, task]));
      setTitle("");
      setSkill("");
      setRepeat("none");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleToggle(task: Task) {
    const done = !task.done;
    setError("");
    // Show the tick straight away, and undo it if saving fails.
    setTasks((current) => current.map((t) => (t.id === task.id ? { ...t, done } : t)));
    try {
      await setTaskDone(task.id, done);
    } catch (err) {
      setTasks((current) => current.map((t) => (t.id === task.id ? { ...t, done: !done } : t)));
      setError(err instanceof Error ? err.message : "Something went wrong.");
      return;
    }

    // Ticking off a repeating task finishes this one and makes the next one.
    // Unticking leaves any copy already made alone.
    if (!done || task.repeat === "none") return;
    try {
      const copy = await createNextCopy(task);
      if (copy) setTasks((current) => byDueDate([...current, copy]));
    } catch {
      setError("Ticked off, but the next one could not be made. Untick it and tick it again to retry.");
    }
  }

  async function handleDelete(task: Task) {
    if (!window.confirm(`Delete "${task.title}"? This can't be undone.`)) return;
    setError("");
    setDeletingId(task.id);
    try {
      await deleteTask(task.id);
      setTasks((current) => current.filter((t) => t.id !== task.id));
      if (openTaskId === task.id) setOpenTaskId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      {!loading && !loadFailed && <SkillBalance tasks={tasks} />}
      <section className="tasks">
        <h2>My study tasks</h2>

        <form className="task-form" onSubmit={handleAdd}>
          <label>
            Task
            <input
              type="text"
              required
              maxLength={200}
              placeholder="Watch one news clip"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label>
            Skill
            <select required value={skill} onChange={(e) => setSkill(e.target.value as Skill)}>
              <option value="" disabled>
                Choose a skill
              </option>
              {SKILLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            Repeats
            <select value={repeat} onChange={(e) => setRepeat(e.target.value as Repeat)}>
              {REPEATS.map((r) => (
                <option key={r} value={r}>
                  {REPEAT_LABELS[r]}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={busy}>
            {busy ? "Adding…" : "Add"}
          </button>
        </form>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="muted">Loading your tasks…</p>
        ) : tasks.length === 0 ? (
          <p className="muted">No tasks yet. Add your first one above.</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className={task.done ? "done" : undefined}>
                <label>
                  <input type="checkbox" checked={task.done} onChange={() => handleToggle(task)} />
                  <span>
                    <span className="task-title">{task.title}</span>
                    <span className="task-meta">
                      Due {formatDate(task.due_on)}
                      {task.repeat !== "none" && ` · Repeats ${task.repeat}`}
                    </span>
                  </span>
                </label>
                <div className="task-actions">
                  <span className="skill-tag">{task.skill}</span>
                  <button
                    type="button"
                    className="secondary small"
                    aria-expanded={openTaskId === task.id}
                    onClick={() => setOpenTaskId(openTaskId === task.id ? null : task.id)}
                  >
                    {openTaskId === task.id ? "Close" : "Notes"}
                  </button>
                  <button
                    type="button"
                    className="secondary small danger"
                    aria-label={`Delete ${task.title}`}
                    disabled={deletingId === task.id}
                    onClick={() => handleDelete(task)}
                  >
                    {deletingId === task.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
                {openTaskId === task.id && <TaskNotes taskId={task.id} />}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
