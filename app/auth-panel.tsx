"use client";

import { FormEvent, useEffect, useState } from "react";
import { Session, loadSession, logIn, logOut, signUp } from "./auth";
import TaskList from "./task-list";

type Mode = "closed" | "login" | "signup";

export default function AuthPanel() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("closed");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadSession().then((s) => {
      setSession(s);
      setLoading(false);
    });
  }, []);

  function open(next: Mode) {
    setMode(next);
    setError("");
    setPassword("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const s = mode === "signup" ? await signUp(email, password) : await logIn(email, password);
      setSession(s);
      setMode("closed");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogOut() {
    if (!session) return;
    await logOut(session);
    setSession(null);
    setEmail("");
    open("closed");
  }

  if (loading) {
    return <div className="auth-bar" aria-busy="true">Loading…</div>;
  }

  if (session) {
    return (
      <>
        <div className="auth-bar">
          <span>
            Signed in as <strong>{session.email}</strong>
          </span>
          <button type="button" onClick={handleLogOut}>
            Log out
          </button>
        </div>
        {/* key makes the list reload from scratch when a different account signs in */}
        <TaskList key={session.email} />
      </>
    );
  }

  return (
    <div className="auth-bar">
      <div className="auth-buttons">
        <button type="button" onClick={() => open("login")}>
          Log in
        </button>
        <button type="button" className="secondary" onClick={() => open("signup")}>
          Sign up
        </button>
      </div>

      {mode !== "closed" && (
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>{mode === "signup" ? "Create an account" : "Log in"}</h2>
          <label>
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy}>
            {busy ? "Please wait…" : mode === "signup" ? "Sign up" : "Log in"}
          </button>
        </form>
      )}
    </div>
  );
}
