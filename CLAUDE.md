# AI Workshop

## Stack
- Next.js with the App Router, TypeScript, plain CSS. No CSS frameworks.
- Supabase for sign-in and stored data. Project URL: https://kifzxxkdhbwdvivwkqno.supabase.co
- Deployed on Vercel. Every pushed branch gets a preview link on its pull request. Merging to main deploys the live site at ai-workshop-tawny.vercel.app.

## Commands
- `npm install` installs dependencies.
- `npm run dev` runs the site locally.
- `npm run build` must finish with no errors before every push.
- `npm run lint` checks code style.
- These assume npm and the default Next.js scripts. If package.json says otherwise, follow package.json and say so in the pull request.

## Never
- Add a dependency without asking first.
- Edit .env or any environment variable.
- Change auth configuration without saying what is changing and why.
- Create new top-level folders.
- Add a new service or account without asking first.
- Merge a pull request. Tia merges.
- Edit roadmap.md, project-state.md, or CLAUDE.md during feature work. Only a dedicated docs session edits them.
- Put passwords, API keys, or connection strings in code, prompts, or any file in the repo. They belong in Vercel, under the project's Settings, then Environment Variables.
- Use real personal data. Fake names and fake content only.

## Conventions
- Work on a branch, push it, open a draft pull request, then stop.
- Every pull request description explains, in plain language for someone with no coding background, what changed, why, and how to check it on the Vercel preview link.
- Flag anything Tia would need to understand to explain it at a live session.
- Skills are a fixed list: Listening, Speaking, Reading, Writing.
- Every Supabase table that holds user data has row level security turned on, so each user can read and change only their own rows.

## Current focus
See roadmap.md. Work only on the slice marked ACTIVE.
