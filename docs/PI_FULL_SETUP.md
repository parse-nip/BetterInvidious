# Run BetterInvidious Fully on Raspberry Pi

No Fly.io. Everything runs on your Pi. Cheaper, simpler, and your residential IP handles YouTube directly.

**→ For a full step-by-step tutorial (including remote setup via Pi Connect), see [PI_MIGRATION_TUTORIAL.md](PI_MIGRATION_TUTORIAL.md).**

## Architecture

```
You (browser)  →  bore.pub:PORT  →  Pi (Invidious + Companion + tinyproxy)  →  YouTube
```

## Prerequisites

- Raspberry Pi 4 (4GB+) or Pi 5 recommended
- Docker and Docker Compose installed
- tinyproxy already configured (from PROXY_VIA_PC.md)

## Step 1: Prepare on your PC

1. **Build the React UI** (required for BetterInvidious frontend):

   ```powershell
   .\scripts\build-react-ui.ps1
   ```

2. **Copy the project to your Pi** (replace with your Pi's hostname/IP):

   ```powershell
   scp -r C:\Users\rootbeer\Downloads\BetterInvidious user@betterinvidious-proxy.local:~/
   ```

   Or use `rsync` for faster updates:

   ```powershell
   rsync -avz --exclude node_modules --exclude .git C:\Users\rootbeer\Downloads\BetterInvidious\ user@betterinvidious-proxy.local:~/BetterInvidious/
   ```

## Step 2: On the Pi – ensure tinyproxy is running

```bash
sudo systemctl status tinyproxy
# If not running:
sudo systemctl start tinyproxy
```

tinyproxy must listen on `0.0.0.0:3128` (see PROXY_VIA_PC.md).

## Step 3: On the Pi – start the stack

```bash
cd ~/BetterInvidious/invidious
docker compose -f docker-compose.pi.yml up -d --build
```

**First build takes 45–90 minutes** on a Pi 4 (Crystal compilation). Later starts are much faster.

## Step 4: Expose to the internet

**Option A: Bore tunnel** (no router config)

```bash
bore local 3000 --to bore.pub
```

Use the URL shown (e.g. `http://bore.pub:12345`). The port changes each time you restart bore.

**Option B: Port forward**

Forward port 3000 from your router to the Pi's local IP.

Then visit `http://YOUR_PUBLIC_IP:3000` or `http://bore.pub:PORT`.

## Step 5: Run bore as a service (optional)

To keep bore running after you disconnect:

```bash
sudo nano /etc/systemd/system/bore-web.service
```

```ini
[Unit]
Description=Bore tunnel for BetterInvidious web
After=network.target docker.service

[Service]
Type=simple
ExecStart=/usr/local/bin/bore local 3000 --to bore.pub
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable bore-web
sudo systemctl start bore-web
```

**Note:** Bore's port changes on restart. You'll need to use the new URL each time.

## Useful commands

```bash
# View logs
docker compose -f docker-compose.pi.yml logs -f

# Stop
docker compose -f docker-compose.pi.yml down

# Rebuild after code changes
docker compose -f docker-compose.pi.yml up -d --build
```

## Troubleshooting

- **"Connection refused" to companion:** Ensure tinyproxy is running and listening on 0.0.0.0:3128.
- **Build fails:** Ensure `invidious/assets/react/` exists (run build-react-ui.ps1 on PC first).
- **Out of memory:** Pi 4 with 2GB may struggle. Close other apps or add swap.
