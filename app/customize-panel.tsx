"use client";

import { useEffect, useState } from "react";

// Each mood is a color theme. The colors themselves live in globals.css under [data-mood="..."].
const MOODS = [
  { id: "happy", label: "Happy", hint: "Bright pink", swatch: "#c2185b" },
  { id: "calm", label: "Calm", hint: "Ocean blue", swatch: "#1f5f8b" },
  { id: "fresh", label: "Fresh", hint: "Leafy green", swatch: "#2e7d4f" },
  { id: "sunny", label: "Sunny", hint: "Warm orange", swatch: "#b4530a" },
  { id: "dreamy", label: "Dreamy", hint: "Soft lavender", swatch: "#6d4aa8" },
  { id: "sleepy", label: "Sleepy", hint: "Dark, easy on tired eyes", swatch: "#2a2530" },
] as const;

const SIZES = [
  { id: "small", label: "Small" },
  { id: "default", label: "Default" },
  { id: "large", label: "Large" },
] as const;

const DEFAULT_MOOD = "happy";
const DEFAULT_SIZE = "default";

// Choices are saved in this browser only, so they stay after a reload but do not follow an account.
function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private windows can block storage; the choice still applies until the page is closed.
  }
}

export default function CustomizePanel() {
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState<string>(DEFAULT_MOOD);
  const [size, setSize] = useState<string>(DEFAULT_SIZE);

  // The script in layout.tsx has already applied the saved choices; read them back into the controls.
  useEffect(() => {
    const root = document.documentElement;
    setMood(root.dataset.mood || DEFAULT_MOOD);
    setSize(root.dataset.size || DEFAULT_SIZE);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function chooseMood(id: string) {
    setMood(id);
    document.documentElement.dataset.mood = id;
    save("mood", id);
  }

  function chooseSize(id: string) {
    setSize(id);
    document.documentElement.dataset.size = id;
    save("text-size", id);
  }

  return (
    <>
      <button
        type="button"
        className="customize-toggle"
        aria-expanded={open}
        aria-controls="customize-drawer"
        onClick={() => setOpen(true)}
      >
        Customize
      </button>

      <div
        className={`customize-backdrop${open ? " open" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        id="customize-drawer"
        className={`customize-drawer${open ? " open" : ""}`}
        aria-label="Customize"
      >
        <div className="customize-header">
          <h2>Customize</h2>
          <button type="button" className="secondary small" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>

        <details className="customize-group" open>
          <summary>How are you feeling today?</summary>
          <fieldset>
            <legend className="visually-hidden">Color mood</legend>
            {MOODS.map((m) => (
              <label key={m.id} className="choice">
                <input
                  type="radio"
                  name="mood"
                  value={m.id}
                  checked={mood === m.id}
                  onChange={() => chooseMood(m.id)}
                />
                <span className="swatch" style={{ background: m.swatch }} aria-hidden="true" />
                <span>
                  <span className="choice-label">{m.label}</span>
                  <span className="choice-hint">{m.hint}</span>
                </span>
              </label>
            ))}
          </fieldset>
        </details>

        <details className="customize-group">
          <summary>Text size</summary>
          <fieldset>
            <legend className="visually-hidden">Text size</legend>
            {SIZES.map((s) => (
              <label key={s.id} className="choice">
                <input
                  type="radio"
                  name="text-size"
                  value={s.id}
                  checked={size === s.id}
                  onChange={() => chooseSize(s.id)}
                />
                <span className="choice-label">{s.label}</span>
              </label>
            ))}
          </fieldset>
        </details>
      </aside>
    </>
  );
}
