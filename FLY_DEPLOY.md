# Deploy BetterInvidious to Fly.io

This guide deploys BetterInvidious (Invidious + React UI) with Invidious Companion and Fly Postgres.

## Architecture

- **betterinvidious** – Main app (Invidious + React frontend)
- **betterinvidious-companion** – Internal service for video playback (not exposed publicly)
- **Fly Postgres** – Managed PostgreSQL database

## Prerequisites

1. [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/) installed
2. `fly auth login` completed
3. React UI built and copied into Invidious assets (see below)

## Step 1: Build the React UI

From the project root:

```powershell
.\scripts\build-react-ui.ps1
```

This builds the frontend and copies it to `invidious/assets/react/`.

## Step 2: Create Fly Postgres

```bash
fly postgres create --name betterinvidious-db
```

Choose a region (e.g. `iad` for US East). When prompted for the initial database name, use `invidious` or accept the default.

## Step 3: Attach Postgres to the Invidious app

First create the app (without deploying):

```bash
cd invidious
fly apps create betterinvidious
```

Then attach the Postgres cluster (replace `betterinvidious-db` with your Postgres app name):

```bash
fly postgres attach betterinvidious-db -a betterinvidious
```

This sets the `DATABASE_URL` secret on the `betterinvidious` app.

## Step 4: Create and deploy the Companion app

The companion must be deployed before the main app (Invidious connects to it on startup).

> **⚠️ PROXY is required on Fly.io.** YouTube blocks datacenter IPs (including Fly.io). Without a proxy, you will see `Failed to validate PO token` and `No valid format found for video` in the logs. It works locally because your home IP is residential; Fly.io IPs are not. Obtain a residential or non-datacenter proxy before deploying.

```bash
# From invidious/
fly apps create betterinvidious-companion
```

Generate a 16-character secret key (use the same key for both apps):

```bash
# Linux/macOS
COMPANION_KEY=$(openssl rand -hex 8)

# Or use any 16-char string, e.g. "a1b2c3d4e5f6g7h8"
```

Set the companion secrets:

```bash
fly secrets set SERVER_SECRET_KEY="$COMPANION_KEY" -a betterinvidious-companion

# REQUIRED: YouTube blocks Fly.io IPs. Use HTTP/HTTPS or SOCKS5 proxy (residential/non-datacenter).
# Replace with your proxy URL. Examples: Bright Data, Oxylabs, or a residential VPN's proxy.
fly secrets set PROXY="http://user:pass@proxy-host:port" -a betterinvidious-companion
# Or SOCKS5: fly secrets set PROXY="socks5://proxy-host:port" -a betterinvidious-companion
```

Deploy the companion (uses pre-built image, no build):

```bash
fly deploy -c companion/fly.toml
```

Ensure the companion app is in the **same region** as the main app for low latency. Use `fly regions list` and set `primary_region` if needed.

## Step 5: Set Invidious secrets

Use the **same** 16-character key as the companion, plus a separate HMAC key:

```bash
# Same key as SERVER_SECRET_KEY for companion
fly secrets set INVIDIOUS_INVIDIOUS_COMPANION_KEY="$COMPANION_KEY" -a betterinvidious

# Generate a separate HMAC key (20+ chars recommended)
fly secrets set INVIDIOUS_HMAC_KEY="$(openssl rand -hex 12)" -a betterinvidious
```

## Step 6: Update domain in fly.toml (if needed)

If your app name is not `betterinvidious`, edit `invidious/fly.toml` and change the `domain` in `INVIDIOUS_CONFIG` to match (e.g. `my-custom-name.fly.dev`).

## Step 7: Deploy the main app

```bash
cd invidious
fly deploy
```

The first deploy will:

1. Build the Invidious Docker image (15–30 min for Crystal compile)
2. Run database migrations
3. Start the app

## Step 8: Open the app

```bash
fly open -a betterinvidious
```

Or visit `https://betterinvidious.fly.dev`.

---

## Troubleshooting

### Video playback fails with "Invidious companion is not available"

- Ensure the companion app is deployed and running: `fly status -a betterinvidious-companion`
- Both apps must be in the same Fly organization for `.internal` DNS to work
- Verify `INVIDIOUS_INVIDIOUS_COMPANION_KEY` matches `SERVER_SECRET_KEY` on the companion

### Database connection errors

- Run `fly postgres attach betterinvidious-db -a betterinvidious` again
- Check `fly secrets list -a betterinvidious` – `DATABASE_URL` should be set

### Build fails

- Ensure the React UI was built: `.\scripts\build-react-ui.ps1`
- The Invidious Dockerfile expects `assets/react/` to exist

### Companion not reachable / "Name has no usable address"

- **Companion machines stopped:** `.internal` DNS only returns running machines. If the companion is stopped, the main app cannot resolve it. Ensure `primary_region` in `fly.toml` **matches the region where your machines run** (check with `fly status`). If they mismatch, `min_machines_running` won't apply and machines will autostop. Start manually: `fly machine start <id> -a betterinvidious-companion`
- Companion has no `http_service`, so it is not exposed publicly
- Invidious reaches it via `betterinvidious-companion.internal:8282` over Fly’s private network
- Both apps must be in the same organization and region

### PO token validation fails / "No valid format found for video" / "all validation attempts returned non-200"

**Cause:** YouTube blocks datacenter IPs. Fly.io uses datacenter IPs, so the companion's YouTube requests are rejected. Locally it works because your home IP is residential.

**Fix:** Set a `PROXY` secret and redeploy. Use an HTTP/HTTPS or SOCKS5 proxy with a **residential or non-datacenter** exit IP:

```powershell
# Helper script (prompts for proxy URL)
.\scripts\set-companion-proxy.ps1

# Or manually:
fly secrets set PROXY="http://user:pass@proxy-host:port" -a betterinvidious-companion
# Or SOCKS5: fly secrets set PROXY="socks5://proxy-host:port" -a betterinvidious-companion

# Redeploy so the new secret takes effect
cd invidious && fly deploy -c companion/fly.toml -a betterinvidious-companion
```

**Proxy providers** (residential/non-datacenter): Bright Data, Oxylabs, Smartproxy, or a residential VPN that exposes an HTTP/SOCKS proxy. Datacenter proxies (e.g. typical VPS providers) will not work.

**Route through your PC or Raspberry Pi:** See [docs/PROXY_VIA_PC.md](docs/PROXY_VIA_PC.md) for using your home machine as the proxy (Cloudflare Tunnel, port forward, or ngrok).

**Do not** disable `po_token`—it is required for video playback.

---

## Updating

```bash
# Rebuild React UI
.\scripts\build-react-ui.ps1

# Deploy main app
cd invidious
fly deploy

# Update companion (if needed)
fly deploy -c companion/fly.toml -a betterinvidious-companion
```
