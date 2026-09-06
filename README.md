[Uploading README.md…]()
# TaskFlow — Kanban Board

React Kanban board with a real backend powered by **Supabase** (Postgres database + auth + realtime).

## Features

- Email/password sign up and sign in, plus "Continue with Google"
- Shared board — every signed-in user sees the same tasks
- Real-time sync — changes made by one user appear instantly for everyone else
- Assign tasks to a specific teammate
- Attach an image to a task
- In-app + browser notifications for tasks due today or overdue
- Add / edit / delete tasks
- Drag and drop between columns
- Search tasks
- Filter by priority
- Dark mode
- Command menu (`Ctrl+K` / `Cmd+K`)
- Responsive layout
- Keyboard accessible

> Real email notifications (e.g. "you were assigned a task") need a separate email-sending service (like Resend) wired up through a Supabase Edge Function — not included here, since it needs its own account/API key. Ask if you want this added later.

## Tech Stack

- React 18 + Vite
- Supabase (Postgres, Auth, Realtime)
- Plain CSS

## Backend Setup (Supabase) — do this first

1. Go to [supabase.com](https://supabase.com), sign up, and create a new project (pick any name/region, set a database password).
2. Once the project is ready, open **SQL Editor** in the left sidebar, click **New Query**, paste the contents of `supabase-schema.sql` (in this repo), and click **Run**. This creates the `tasks` table, security rules, and turns on realtime.
3. Go to **Settings > API**. Copy the **Project URL** and the **anon public** key.
4. In this project, copy `.env.example` to a new file named `.env`, and paste in your values:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
5. By default Supabase requires email confirmation for sign-ups. For quick local testing you can turn this off: **Authentication > Providers > Email > Confirm email > toggle off**. (Keep it on for a real production app.)
6. If you already ran the old `supabase-schema.sql`, run **`supabase-schema-v2.sql`** as well (same SQL Editor > New Query > Run) — it adds the `profiles` table, task assignment, and attachment columns. If this is a fresh project, running `supabase-schema-v2.sql` alone is enough — it includes everything.
7. **Enable image attachments**: go to **Storage** in the left sidebar > **New bucket** > name it exactly `task-attachments` > toggle **Public bucket** on > **Create bucket**. (The access policies for it were already created by the SQL script.)
8. **Enable "Continue with Google" (optional)**:
   - In [Google Cloud Console](https://console.cloud.google.com/), create an OAuth 2.0 Client ID (Web application). Add this as an **Authorized redirect URI**: `https://your-project-id.supabase.co/auth/v1/callback` (find the exact value in Supabase under Authentication > Providers > Google once you open it).
   - Copy the generated **Client ID** and **Client Secret**.
   - In Supabase: **Authentication > Providers > Google**, toggle it on, paste the Client ID and Secret, save.
   - If you skip this, the email/password login still works fine — the Google button just won't complete sign-in until this is set up.

`.env` is already in `.gitignore` — never commit real keys to GitHub.

## Run Locally

```bash
npm install
npm run dev
```

Open the app at:

```
http://localhost:5173
```

## Build for Production

```bash
npm run build
```

Output goes to the `dist/` folder. Preview it with:

```bash
npm run preview
```

## Deploy

This is a static site (just HTML/CSS/JS after build), so it deploys easily to:

- **Vercel**: import the GitHub repo, framework preset "Vite" (auto-detects build command `npm run build`, output dir `dist`). In **Project Settings > Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with your Supabase values, then redeploy.
- **Netlify**: build command `npm run build`, publish directory `dist`. Add the same two env vars in **Site settings > Environment variables**.
- **GitHub Pages**: run `npm run build`, then push the `dist` folder to a `gh-pages` branch (or use the `gh-pages` npm package).

## Push to GitHub from VS Code

1. Open this folder in VS Code.
2. Open the terminal and run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
3. Create a new repository on GitHub, then run:
   ```bash
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git branch -M main
   git push -u origin main
   ```
4. Alternatively, use the built-in **Source Control** panel in VS Code (the icon on the left sidebar) to initialize, commit, and publish the repo with a few clicks.
