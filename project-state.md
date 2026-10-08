# Project state
Last updated: 2026-10-08

## Works
- Live Next.js site (App Router, TypeScript, plain CSS) deployed on Vercel at ai-workshop-tawny.vercel.app.
- A Supabase project exists and is linked to the repo.

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
