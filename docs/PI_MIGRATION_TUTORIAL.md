# Full Tutorial: Moving BetterInvidious to Raspberry Pi

Complete step-by-step guide for running BetterInvidious entirely on your Pi. Works with remote access via Pi Connect (shell + desktop).

---

## Overview

| What | Where |
|------|-------|
| Invidious (web app) | Pi |
| PostgreSQL (database) | Pi |
| Companion (video playback) | Pi |
| tinyproxy (YouTube proxy) | Pi |
| bore (tunnel to internet) | Pi |

**No Fly.io. No monthly costs.** Your Pi's residential IP handles YouTube.

---

## Part 1: Prepare on Your PC (Do This First)

Do this when you have access to your PC at home.

### 1.1 Build the React UI

Open PowerShell in the project folder:

```powershell
cd C:\Users\rootbeer\Downloads\BetterInvidious
.\scripts\build-react-ui.ps1
```

This creates `invidious/assets/react/` with the frontend. **Required** — the Docker build will fail without it.

### 1.2 Transfer the Project to the Pi

**Option A: SCP (from your PC, Pi must be reachable)**

```powershell
scp -r C:\Users\rootbeer\Downloads\BetterInvidious user@betterinvidious-proxy.local:~/
```

**Option B: rsync (faster for updates)**

```powershell
rsync -avz --exclude node_modules --exclude .git C:\Users\rootbeer\Downloads\BetterInvidious\ user@betterinvidious-proxy.local:~/BetterInvidious/
```

**Option C: Git (if you have a remote repo)**

On the Pi:
```bash
git clone https://github.com/YOUR_USERNAME/BetterInvidious.git ~/BetterInvidious
cd ~/BetterInvidious
```
Then build the React UI on the Pi (see Part 2.5) or transfer the built `assets/react/` folder.

**Option D: Cloud storage (school → Pi)**

1. Zip the project on your PC: `Compress-Archive -Path BetterInvidious -DestinationPath BetterInvidious.zip`
2. Upload to Google Drive / OneDrive / Dropbox
3. From Pi Connect desktop, open a browser and download the zip
4. Unzip: `unzip BetterInvidious.zip -d ~/`

---

## Part 2: Pi Setup (Via Pi Connect)

Connect to your Pi via Pi Connect (shell or desktop). Run these in order.

### 2.1 Update the System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.2 Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Add your user to the docker group (so you don't need sudo)
sudo usermod -aG docker $USER

# Log out and back in for the group to take effect, or run:
newgrp docker
```

### 2.3 Install tinyproxy

```bash
sudo apt install -y tinyproxy
sudo sed -i 's/^Listen .*/Listen 0.0.0.0:3128/' /etc/tinyproxy/tinyproxy.conf
sudo systemctl enable tinyproxy
sudo systemctl start tinyproxy
sudo systemctl status tinyproxy
```

You should see `active (running)`.

### 2.4 Install bore (for exposing the app)

```bash
cd ~
wget https://github.com/ekzhang/bore/releases/download/v0.6.0/bore-v0.6.0-aarch64-unknown-linux-musl.tar.gz
tar -xzf bore-v0.6.0-aarch64-unknown-linux-musl.tar.gz
sudo mv bore /usr/local/bin/
rm bore-v0.6.0-aarch64-unknown-linux-musl.tar.gz
bore --version
```

### 2.5 Build React UI on Pi (if you didn't transfer it)

If you used Git clone or cloud transfer without the built assets:

```bash
cd ~/BetterInvidious/frontend
# Install Node.js if needed: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs
npm install
npm run build
mkdir -p ../invidious/assets/react
cp -r dist/* ../invidious/assets/react/
```

---

## Part 3: Run the Stack

### 3.1 Start Docker Compose

```bash
cd ~/BetterInvidious/invidious
docker compose -f docker-compose.pi.yml up -d --build
```

**First run:** The Invidious image build takes **45–90 minutes** on a Pi 4 (Crystal compilation). You can leave it running and disconnect — it will continue.

**Check progress:**
```bash
docker compose -f docker-compose.pi.yml logs -f
```

Press `Ctrl+C` to stop following logs. The build continues in the background.

### 3.2 Verify Services

When the build finishes:

```bash
docker compose -f docker-compose.pi.yml ps
```

You should see `invidious`, `companion`, and `invidious-db` all `Up`.

**Test locally:**
```bash
curl -s http://localhost:3000/api/v1/stats | head -5
```

If you get JSON output, Invidious is running.

---

## Part 4: Expose to the Internet

### 4.1 Start bore Tunnel

```bash
bore local 3000 --to bore.pub
```

You'll see something like:
```
listening at bore.pub:12345
```

**Your app is now at:** `http://bore.pub:12345`

### 4.2 Keep bore Running After Disconnect

Run bore in the background:

```bash
nohup bore local 3000 --to bore.pub > /tmp/bore.log 2>&1 &
```

Check the log for the port:
```bash
cat /tmp/bore.log
```

### 4.3 (Optional) bore as a System Service

So bore starts on boot and survives reboots:

```bash
sudo nano /etc/systemd/system/bore-web.service
```

Paste:

```ini
[Unit]
Description=Bore tunnel for BetterInvidious
After=network.target docker.service

[Service]
Type=simple
ExecStart=/usr/local/bin/bore local 3000 --to bore.pub
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Save (`Ctrl+O`, Enter, `Ctrl+X`), then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable bore-web
sudo systemctl start bore-web
```

**Note:** Bore's port changes each time it restarts. Check the new URL with:
```bash
journalctl -u bore-web -f
```

---

## Part 5: Use Your Instance

1. Open `http://bore.pub:PORT` in your browser (use the port from bore's output).
2. Search for a video and play it.
3. If playback works, you're done.

---

## Quick Reference

| Task | Command |
|------|---------|
| View logs | `docker compose -f docker-compose.pi.yml logs -f` |
| Stop stack | `docker compose -f docker-compose.pi.yml down` |
| Start stack | `docker compose -f docker-compose.pi.yml up -d` |
| Rebuild after changes | `docker compose -f docker-compose.pi.yml up -d --build` |
| Check bore port | `cat /tmp/bore.log` or `journalctl -u bore-web -n 20` |

---

## Troubleshooting

### Build fails: "assets/react not found"
Run `.\scripts\build-react-ui.ps1` on your PC and transfer the project again, or build on Pi (Part 2.5).

### "Connection refused" to companion
- Ensure tinyproxy is running: `sudo systemctl status tinyproxy`
- Ensure it listens on 0.0.0.0:3128: `grep Listen /etc/tinyproxy/tinyproxy.conf`

### Out of memory during build
Add swap:
```bash
sudo sysctl vm.swappiness=60
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Video playback fails
- Check companion logs: `docker compose -f docker-compose.pi.yml logs companion`
- Ensure PROXY is set in the companion (it's in docker-compose.pi.yml)
- Ensure tinyproxy is running

### Can't reach bore.pub URL from school
Some networks block bore.pub. Try from your phone on cellular, or use port forwarding at home instead.

---

## Summary Checklist

- [ ] Built React UI on PC
- [ ] Transferred project to Pi
- [ ] Installed Docker on Pi
- [ ] Installed and started tinyproxy
- [ ] Installed bore
- [ ] Ran `docker compose -f docker-compose.pi.yml up -d --build`
- [ ] Waited for build (45–90 min)
- [ ] Started bore tunnel
- [ ] Opened http://bore.pub:PORT and tested playback
