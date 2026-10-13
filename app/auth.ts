// Talks to Supabase Auth over its HTTP API with fetch, so no extra package is needed.
// The session is kept in localStorage, which survives closing the browser.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const STORAGE_KEY = "ai-workshop-session";

export type Session = {
  access_token: string;
  refresh_token: string;
  expires_at: number; // seconds since 1970
  email: string;
};

type AuthResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  user?: { email?: string };
  email?: string;
  msg?: string;
  message?: string;
  error_description?: string;
};

async function authRequest(
  path: string,
  body: object,
  accessToken?: string,
): Promise<AuthResponse> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Sign-in is not set up on this site yet.");
  }
  const headers: Record<string, string> = {
    apikey: SUPABASE_KEY,
    "Content-Type": "application/json",
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data: AuthResponse = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data.msg || data.error_description || data.message || "Something went wrong. Please try again.",
    );
  }
  return data;
}

function toSession(data: AuthResponse): Session | null {
  if (!data.access_token || !data.refresh_token) return null;
  const expiresAt =
    data.expires_at ?? Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600);
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: expiresAt,
    email: data.user?.email ?? "",
  };
}

function save(session: Session | null) {
  if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  else localStorage.removeItem(STORAGE_KEY);
}

export async function signUp(email: string, password: string): Promise<Session> {
  const data = await authRequest("signup", { email, password });
  const session = toSession(data);
  if (!session) {
    throw new Error("Account created, but it needs email confirmation before you can log in.");
  }
  save(session);
  return session;
}

export async function logIn(email: string, password: string): Promise<Session> {
  const data = await authRequest("token?grant_type=password", { email, password });
  const session = toSession(data);
  if (!session) throw new Error("Could not log in. Please try again.");
  save(session);
  return session;
}

export async function logOut(session: Session): Promise<void> {
  save(null);
  // Also end the session on Supabase's side. If this fails, the user is still logged out here.
  await authRequest("logout", {}, session.access_token).catch(() => {});
}

// Reads the saved session and renews it if it has expired or is about to.
export async function loadSession(): Promise<Session | null> {
  let stored: Session | null = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    stored = raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    stored = null;
  }
  if (!stored) return null;

  const secondsLeft = stored.expires_at - Math.floor(Date.now() / 1000);
  if (secondsLeft > 60) return stored;

  try {
    const data = await authRequest("token?grant_type=refresh_token", {
      refresh_token: stored.refresh_token,
    });
    const session = toSession(data);
    save(session);
    return session;
  } catch {
    save(null);
    return null;
  }
}
