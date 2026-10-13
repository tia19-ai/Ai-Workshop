import { SKILLS, Skill, Task } from "./tasks";

// Counts finished tasks per skill. Every skill tied for the lowest count is "Avoiding".
export function countFinished(tasks: Task[]): Record<Skill, number> {
  const counts = { Listening: 0, Speaking: 0, Reading: 0, Writing: 0 };
  for (const task of tasks) {
    if (task.done) counts[task.skill] += 1;
  }
  return counts;
}

export default function SkillBalance({ tasks }: { tasks: Task[] }) {
  const counts = countFinished(tasks);
  const total = SKILLS.reduce((sum, s) => sum + counts[s], 0);
  const lowest = Math.min(...SKILLS.map((s) => counts[s]));

  return (
    <section className="balance" aria-label="Skill balance">
      <h2>Skill balance</h2>
      <ul className="balance-grid">
        {SKILLS.map((skill) => {
          const avoiding = total > 0 && counts[skill] === lowest;
          return (
            <li key={skill} className={avoiding ? "avoiding" : undefined}>
              <span className="balance-skill">{skill}</span>
              <span className="balance-count">{counts[skill]}</span>
              {avoiding && <span className="avoiding-tag">Avoiding</span>}
            </li>
          );
        })}
      </ul>
      {total === 0 && <p className="muted">No finished tasks yet</p>}
    </section>
  );
}
