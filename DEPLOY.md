# Deployment Guide

Build locally, copy to server, run with `node`. No npm, no PM2 needed on the server.

---

## What you need on the server

- Node.js 22+ (`node --version` to confirm)
- Nginx
- `sqlite3` CLI (optional, for inspecting the DB)

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
```

---

## Build locally

```bash
npm run build:assistant   # builds the Gokul AI assistant → public/assistant/
npm run build
```

`build:assistant` needs the assistant repo checked out at
`../AI/portfolio-assistance` (override with `ASSISTANT_DIR=...`). The output
is a gitignored artifact — run it before every deploy. The assistant serves
at `/assistant`; its API calls hit `/assistant-api/*`, which Next proxies
to the FastAPI backend (`ASSISTANT_API_URL` env, default
`http://localhost:16000` — the backend must run on the server too, see the
assistant repo's DEPLOYMENT.md).

The standalone output lands in `.next/standalone/`. Next.js does not copy public assets into it automatically, so copy them in:

```bash
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
```

---

## First deploy

### 1. Fix permissions once (run this one time only)

```bash
ssh geekay@consoleapi.in "sudo chown -R gokulakannan:gokulakannan /home/gokulakannan/public_html"
```

After this your user owns the directory and all future `scp` commands work without sudo.

### 2. Copy the build to the server

```bash
scp -r .next/standalone/* geekay@consoleapi.in:/home/gokulakannan/public_html/
```

If you still get permission denied, use the temp folder workaround:

```bash
scp -r .next/standalone/* geekay@consoleapi.in:/tmp/portfolio-deploy/
ssh geekay@consoleapi.in "sudo cp -r /tmp/portfolio-deploy/* /home/gokulakannan/public_html/ && rm -rf /tmp/portfolio-deploy"
```

### 3. Seed the database

The app reads from MongoDB (`MONGODB_URI`). On first deploy, copy the legacy
SQLite file up and run the migration seed on the server — it copies the
SQLite data (read-only) into MongoDB, falling back to
`data/portfolio.json` + `content/posts/` when no SQLite file exists:

```bash
scp data/portfolio.db geekay@consoleapi.in:/home/gokulakannan/public_html/data/portfolio.db
ssh geekay@consoleapi.in "cd /home/gokulakannan/public_html && npm run db:seed"
```

### 4. Create the env file on the server

```bash
ssh geekay@consoleapi.in
nano /home/gokulakannan/public_html/.env.local
```

```env
ADMIN_PASSWORD=a-strong-password
AUTH_SECRET=<openssl rand -base64 32>
# URL-encode special chars in the password (@ -> %40)
MONGODB_URI=mongodb://portfolio_admin:<password>@127.0.0.1:27017/personal-portfolio
API_SECRET_KEY=<openssl rand -hex 32>
```

### 5. Test run

```bash
cd /home/gokulakannan/public_html
node server.js
```

Hit `http://consoleapi.in:3000` — if it loads, the build is good. Stop it with `Ctrl+C`.

---

## Keep it running with systemd

`systemd` is already on every Linux server. No install needed.

Create the service file:

```bash
sudo nano /etc/systemd/system/portfolio.service
```

```ini
[Unit]
Description=Portfolio
After=network.target

[Service]
Type=simple
User=gokulakannan
WorkingDirectory=/home/gokulakannan/public_html
EnvironmentFile=/home/gokulakannan/public_html/.env.local
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=127.0.0.1
ExecStart=node server.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable portfolio
sudo systemctl start portfolio
```

Check it's running:

```bash
sudo systemctl status portfolio
journalctl -u portfolio -f        # live logs
```

---

## Nginx

```bash
sudo nano /etc/nginx/sites-available/portfolio
```

```nginx
server {
    listen 80;
    server_name consoleapi.in www.consoleapi.in;

    location /_next/static/ {
        alias /home/gokulakannan/public_html/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /public/ {
        alias /home/gokulakannan/public_html/public/;
        expires 7d;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d consoleapi.in -d www.consoleapi.in
```

---

## Updating (redeploying)

```bash
# Local — rebuild
npm run build
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

# Copy build to server (skip the DB — never overwrite live data)
scp -r .next/standalone/* geekay@consoleapi.in:/home/gokulakannan/public_html/

# Restart on server
ssh geekay@consoleapi.in "sudo systemctl restart portfolio"
```

---

## Database

Data lives in MongoDB on the server (`MONGODB_URI`, database
`personal-portfolio`, collections `posts` and `portfolios`).
**Never re-run `npm run db:seed` after content has been edited live** — it
upserts from the old SQLite/JSON sources and will overwrite newer edits.

Back up before anything risky:

```bash
mongodump --uri="$MONGODB_URI" --out=backup-$(date +%F)
```

Inspect:

```bash
mongosh "$MONGODB_URI" --eval 'db.posts.find({}, {slug:1, title:1, published:1})'
```

The legacy SQLite file (`data/portfolio.db`) is kept only as the one-time
migration source for `db:seed`.

For local dev without a MongoDB install, run the throwaway in-memory server
in a separate terminal: `npx tsx scripts/dev-mongo.ts`.

---

## Troubleshooting

**Service fails to start**
Check the exact error: `journalctl -u portfolio -n 50`

**Portfolio page shows `Portfolio data not found`**
The DB was not copied. Run step 2 of First deploy again.

**Changes not showing after redeploy**
The service may still be running the old build. Run `sudo systemctl restart portfolio`.

claude --resume e4258201-df4d-4401-b92e-648c507e89d0