"use client";

import { FormEvent, useEffect, useState } from "react";
import SkillBalance from "./skill-balance";
import TaskNotes from "./task-notes";
import { SKILLS, Skill, Task, addTask, listTasks, setTaskDone } from "./tasks";

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [skill, setSkill] = useState<Skill | "">("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  useEffect(() => {
    listTasks()
      .then(setTasks)
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
      const task = await addTask(title.trim(), skill);
      setTasks((current) => [...current, task]);
      setTitle("");
      setSkill("");
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
                  <span className="task-title">{task.title}</span>
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
