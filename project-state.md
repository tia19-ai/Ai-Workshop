# Project state
Last updated: 2026-10-13

## Works
- Live Next.js site (App Router, TypeScript, plain CSS) deployed on Vercel at ai-workshop-tawny.vercel.app.
- A Supabase project exists and is linked to the repo.
- On the live site, a person can create an account with an email and a password and is signed in straight away.
- A signed-in person sees "Signed in as" followed by their email, and can log out.
- A person can log back in with the same email and password. A wrong password shows an error message and they stay logged out.
- A signed-in person stays signed in after closing and reopening the browser (in a normal window, not a private one).

## Broken or flaky
- Nothing known. The site does not use Supabase yet, so nothing involving accounts or saved data has been tested.

## Environment notes
- Repo: github.com/tia19-ai/Ai-Workshop, default branch main.
- Every branch pushed to GitHub gets a Vercel preview link on its pull request. Merging to main deploys the live site.
- Supabase project URL: https://kifzxxkdhbwdvivwkqno.supabase.co
- Keys and passwords live only in Vercel, under the project's Settings, then Environment Variables. Not yet confirmed whether the Supabase variables are set there.
- Sign-in will use Supabase email and password.

## Next session
- Start slice 1: sign up and log in.
- Open question: turn off "Confirm email" in Supabase before slice 1? Recommended yes, because Supabase's built-in email sending has a low hourly limit.
- Check whether the Supabase URL and public key are already in Vercel's Environment Variables.
