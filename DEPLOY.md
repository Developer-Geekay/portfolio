# Deployment Guide

**Deploys are automatic: push to `main` and the site is live in ~1–2 minutes.**
No SSH, no scp, no manual builds. GitHub Actions builds the app and ships it to
HostPanel on the server; the server never runs `npm`.

```
push to main
  → GitHub Actions: npm ci → build (Next.js standalone) → tarball + manifest
  → POST to HostPanel deploy endpoint (authenticated by GitHub OIDC — no stored deploy secret)
  → server: verify → extract to releases/<sha> → flip `current` symlink → restart → health check
  → healthy: done · unhealthy: automatic rollback to the previous release, CI run goes red
```

---

## How it's wired

| Piece | Where |
|---|---|
| CI workflow | `.github/workflows/deploy.yml` — 20 lines calling the reusable workflow in `hostpanel-package-nodejs` |
| App identity | `app_id: gokul-portfolio-gokulakannan-dev` (HostPanel Node.js app) |
| Repo secret | `DEPLOY_URL` only (the panel origin — config, not a credential). Deploy auth is GitHub OIDC: only this repo's `main` branch can deploy this app. |
| Server layout | `/home/gokulakannan/public_html/releases/<sha>` + `current` symlink; last 5 releases retained |
| Panel | HostPanel → Node.js → **gokul-portfolio** — Deploy tab shows history, current/previous SHA, and one-click rollback |

Manual run: repo → Actions → *Deploy to HostPanel* → **Run workflow**.
Note: re-running the **same commit** returns `409 Release already exists`
(releases are immutable) — push a commit to redeploy.

## Environment variables

Managed in the panel: **gokul-portfolio → Configuration → Environment Variables**.
There is **no `.env.local` on the server** — the app runs from `current/` and
would not read it. Current set:

- `MONGODB_URI` — `mongodb://portfolio_admin:<password>@127.0.0.1:27017/personal-portfolio?authSource=personal-portfolio` (loopback: the app runs on the server)
- `AUTH_SECRET`, `ADMIN_PASSWORD`, `API_SECRET_KEY`
- `HOSTNAME=127.0.0.1`

Changing env vars restarts the app but does **not** rebuild it. To redeploy the
same code with new env, push any commit.

## Database (MongoDB)

Runs under HostPanel's MongoDB package, **authorization enforced**. The app's
user is `portfolio_admin`, home database `personal-portfolio` — any external
client must set *Authentication Database* / `authSource` to `personal-portfolio`.

Remote access: preferred via SSH tunnel (`ssh -L 27018:127.0.0.1:27017 geekay@consoleapi.in`,
then connect to `127.0.0.1:27018`); direct `gokulakannan.dev:27017` also works
(port is open — keep the password strong). Connection strings with correct
`authSource` are copyable from the panel: MongoDB → Users → select user.

**Never run `npm run db:seed` against live data** — it upserts from the legacy
SQLite/JSON sources and overwrites newer edits. It was a one-time migration.
If a re-seed is ever truly needed, run it from a workstation through the SSH
tunnel; the server cannot run npm scripts.

Backup before anything risky:

```bash
mongodump --uri="mongodb://portfolio_admin:<password>@127.0.0.1:27018/personal-portfolio?authSource=personal-portfolio" --out=backup-$(date +%F)
```

(Panel-side backups also exist: MongoDB → Backups.)

## Assistant (`/assistant` and `/assistant-api`)

- `/assistant-api/*` → FastAPI backend, proxied by a **custom reverse-proxy
  route** configured in the panel (gokul-portfolio → Configuration → Custom
  Reverse Proxy Routes: `/assistant-api` → host/port of the backend).
  This is data, not a hand edit — it survives every vhost regeneration.
  **Do not hand-edit nginx configs; they are generated and will be overwritten.**
- `/assistant` (the static assistant UI) is **not currently built by CI** —
  known gap. The deployed site serves whatever `public/assistant/` was in the
  last build (currently absent). To include it, the CI `build_cmd` needs a
  checkout of `portfolio-assistance` + `npm run build:assistant` before
  `npm run build`.

## Nginx, SSL, systemd

All managed by HostPanel — the vhost, the TLS cert, and the app's systemd unit
are generated. Don't create unit files, don't edit vhosts, don't run certbot
by hand.

## Troubleshooting

| Symptom | Where to look |
|---|---|
| CI run red at Deploy step | The step log prints the deployment status/reason; panel Deploy tab → history shows `failed`/`rolled_back` with detail |
| Broken deploy | It already rolled back automatically; fix the code, push again |
| Need to roll back manually | Panel Deploy tab → *Roll Back to Previous* (or pick any retained SHA) |
| App down / 502 | Panel → gokul-portfolio → Logs, or on the server: `journalctl -u hostpanel-nodejs-gokul-portfolio-gokulakannan-dev -n 50` |
| `Portfolio data not found` | MongoDB down or `MONGODB_URI` wrong — check panel env vars and MongoDB package status |
| Changes not visible | Check the Actions run actually went green and the Deploy tab shows the new SHA as `healthy` |

## Local development

Unchanged: `npm run dev`, and for a throwaway local MongoDB
`npx tsx scripts/dev-mongo.ts` in a separate terminal.
