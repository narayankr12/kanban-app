# TaskFlow — Kanban Board

Frontend-only React Kanban board. No backend — all data is saved in the browser's `localStorage`.

## Features

- Add / edit / delete tasks
- Drag and drop between columns
- Search tasks
- Filter by priority
- Dark mode
- Command menu (`Ctrl+K` / `Cmd+K`)
- Responsive layout
- Keyboard accessible

## Tech Stack

- React 18
- Vite
- Plain CSS

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

- **Vercel**: import the GitHub repo, framework preset "Vite", it auto-detects build command `npm run build` and output dir `dist`.
- **Netlify**: build command `npm run build`, publish directory `dist`.
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
