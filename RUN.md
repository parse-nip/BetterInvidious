# Run BetterInvidious (popped.dev)

## React UI (default)

The UI is now a React SPA. Before running with Docker, build the React frontend and copy it into Invidious assets:

```powershell
cd c:\Users\rootbeer\Downloads\BetterInvidious
.\scripts\build-react-ui.ps1
```

Or manually:

```powershell
cd frontend
npm run build
# Copy frontend\dist\* to invidious\assets\react\
```

When `invidious/assets/react/index.html` exists, the backend serves the React app for all UI routes.

## Docker

### One-time setup

1. **Docker Desktop** – If not installed, it was installed via winget. Start **Docker Desktop** from the Start menu and wait until it shows “Docker Desktop is running”.
2. **Docker Compose** – Installed via winget (command: `docker-compose`).

## Run the app

From a **new** PowerShell or terminal (so Docker is on PATH):

```powershell
cd c:\Users\rootbeer\Downloads\BetterInvidious\invidious
docker-compose up --build -d
```

Or double‑click **`invidious\run-invidious.ps1`** (or run it from PowerShell).

- **First run:** Building the image can take **15–30 minutes** (Crystal + deps compile in Docker).
- When the build and startup finish, open: **http://127.0.0.1:3000**

## Stop

```powershell
cd c:\Users\rootbeer\Downloads\BetterInvidious\invidious
docker-compose down
```

## If Docker isn’t in PATH

Use the full path:

```powershell
$env:Path = "C:\Program Files\Docker\Docker\resources\bin;" + $env:Path
cd c:\Users\rootbeer\Downloads\BetterInvidious\invidious
docker-compose up --build -d
```

---

## Making Videos Work

Video playback requires **Invidious Companion** (YouTube changed their API; companion handles attestation). The Docker Compose setup includes it automatically.

### How it works

1. **Invidious Companion** runs alongside Invidious and fetches video streams from YouTube.
2. **WatchPage** calls `api.getVideo(videoId, true)` — the `true` enables local/proxied formats.
3. **VideoPlayer** picks the best format from `formatStreams` and uses:
   ```
   /latest_version?id={videoId}&itag={itag}
   ```
4. The Invidious backend proxies requests to the companion, which serves the video.

### Requirements

- **Invidious + Companion** — Docker Compose starts both. If you see "Invidious companion is not available", ensure `docker-compose up` is running (companion is in the stack).
- **Proxy enabled** — Invidious proxies video through the companion by default.
- **No extra CORS** — Same-origin requests avoid CORS.

### If videos don't play

1. **Check companion is running** — `docker ps` should show `invidious-companion` (or `companion`).
2. **Check formatStreams** — Open DevTools → Network. The video request to `/api/v1/videos/{id}?local=true` should include `formatStreams` with `itag` values.
3. **Check /latest_version** — The `<video src="...">` should point to `/latest_version?id=...&itag=...`. If that request fails (4xx/5xx), the companion or YouTube access may be blocked.
4. **HLS for live streams** — Live videos use `hlsUrl` when available; the player falls back to it for `liveNow` videos.

### Development (Vite proxy)

When running `npm run dev` in `frontend/`, Vite proxies `/api` and other paths to Invidious (default port 3000). Ensure Invidious is running so video requests go through it.

---

## Deployment

### Fly.io

See **[FLY_DEPLOY.md](FLY_DEPLOY.md)** for full instructions to deploy to Fly.io (Invidious + Companion + Postgres).

### Build for production (Docker / self-hosted)

1. **Build the React UI:**
   ```powershell
   cd frontend
   npm run build
   ```

2. **Copy to Invidious assets:**
   ```powershell
   # From project root
   .\scripts\build-react-ui.ps1
   ```
   Or manually: copy `frontend/dist/*` into `invidious/assets/react/`.

3. **Run Invidious** — Docker or Crystal:
   ```powershell
   cd invidious
   docker-compose up --build -d
   ```

### Production checklist

- **Reverse proxy** — Put Nginx or Caddy in front of Invidious for TLS and domain routing.
- **Config** — Edit `invidious/config/config.yml`:
  - `domain`: your public domain (e.g. `popped.dev`)
  - `https_only`: `true` for HTTPS
  - `external_port`: 443 if behind a reverse proxy
- **Database** — Invidious uses PostgreSQL. Docker Compose typically sets this up.
- **Secrets** — Set `hmac_key`, `cookie_key`, and any API keys in config or env.

### Example Nginx config

```nginx
server {
    listen 443 ssl;
    server_name popped.dev;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }
}
```

### Docker production

From `invidious/`:

```powershell
docker-compose up --build -d
```

Ensure `config/config.yml` is mounted or baked into the image with correct `domain` and `https_only` settings.
