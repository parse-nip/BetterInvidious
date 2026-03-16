# Host at invidious.popped.dev

Use a Cloudflare Tunnel to serve BetterInvidious at **invidious.popped.dev** with HTTPS. Your existing Pi setup (Docker, tinyproxy, bore) stays as-is — the tunnel adds a custom domain layer.

---

## Prerequisites

- BetterInvidious running on Pi (Docker stack + tinyproxy + bore)
- Domain `popped.dev` (or subdomain) in Cloudflare
- Cloudflare account

---

## Step 1: Install cloudflared on the Pi

```bash
cd ~
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/
cloudflared --version
```

---

## Step 2: Log in and create a tunnel

```bash
cloudflared tunnel login
```

This opens a browser URL — log in with your Cloudflare account and authorize. A cert file is saved to `~/.cloudflared/`.

```bash
cloudflared tunnel create betterinvidious
```

Note the **Tunnel ID** (e.g. `abc123-def456-...`).

---

## Step 3: Configure the tunnel

```bash
mkdir -p ~/.cloudflared
nano ~/.cloudflared/config.yml
```

Paste (replace `YOUR_TUNNEL_ID` with the ID from step 2):

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /home/user/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: invidious.popped.dev
    service: http://localhost:3000
  - service: http_status:404
```

Save (Ctrl+O, Enter, Ctrl+X).

---

## Step 4: Add DNS in Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → your zone (`popped.dev`)
2. **DNS** → **Records** → **Add record**
3. Type: **CNAME**
4. Name: `invidious` (or `invidious.popped.dev` depending on UI)
5. Target: `YOUR_TUNNEL_ID.cfargotunnel.com`
6. Proxy status: **Proxied** (orange cloud)
7. Save

---

## Step 5: Run the tunnel

**One-off test:**

```bash
cloudflared tunnel run betterinvidious
```

Visit `https://invidious.popped.dev` — it should load Invidious.

**As a systemd service (starts on boot):**

```bash
sudo cloudflared service install
```

Or manually:

```bash
sudo nano /etc/systemd/system/cloudflared.service
```

```ini
[Unit]
Description=Cloudflare Tunnel for BetterInvidious
After=network.target docker.service

[Service]
Type=simple
ExecStart=/usr/local/bin/cloudflared tunnel --config /home/user/.cloudflared/config.yml run betterinvidious
Restart=always
RestartSec=5
User=user
# Replace "user" with your actual Pi username if different

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

---

## Bore vs Cloudflare Tunnel

| Use case | Bore | Cloudflare Tunnel |
|---------|------|-------------------|
| Quick test | ✅ | — |
| Custom domain | ❌ | ✅ invidious.popped.dev |
| HTTPS | ❌ (HTTP only) | ✅ Automatic |
| Port changes | Yes (random) | No (stable URL) |

You can run **both** — bore for quick access, Cloudflare for the main domain. Both tunnel to `localhost:3000`.

---

## Update Invidious config for the domain

In `docker-compose.pi.yml`, the Invidious config has `domain: "localhost"`. For proper links when using invidious.popped.dev, you can set:

```yaml
environment:
  INVIDIOUS_CONFIG: |
    ...
    domain: "invidious.popped.dev"
    https_only: true
```

Then rebuild: `docker compose -f docker-compose.pi.yml up -d --build`
