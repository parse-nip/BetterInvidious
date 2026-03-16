# Pi Setup via GitHub — Quick Reference

Use this when deploying BetterInvidious to your Raspberry Pi via GitHub.

---

## On Your PC (Done)

- [x] React UI built (`.\scripts\build-react-ui.ps1`)
- [x] Git repo initialized and committed
- [x] Bore systemd service added (`scripts/pi/bore-web.service`)
- [x] Pi setup script added (`scripts/pi/setup-pi.sh`)

---

## Push to GitHub (You Do This)

1. Create a new repository on GitHub (e.g. `BetterInvidious`).
2. Add the remote and push:

```powershell
cd C:\Users\rootbeer\Downloads\BetterInvidious
git remote add origin https://github.com/YOUR_USERNAME/BetterInvidious.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## On Your Pi (Via Pi Connect)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/BetterInvidious.git ~/BetterInvidious
cd ~/BetterInvidious
```

### 2. Run the setup script (optional — automates Part 2 of the tutorial)

```bash
chmod +x scripts/pi/setup-pi.sh
./scripts/pi/setup-pi.sh
```

**Or** follow [docs/PI_MIGRATION_TUTORIAL.md](PI_MIGRATION_TUTORIAL.md) Parts 2.1–2.5 manually.

### 3. Start the Docker stack

```bash
cd ~/BetterInvidious/invidious
docker compose -f docker-compose.pi.yml up -d --build
```

First build: **45–90 minutes** on a Pi 4. Check progress:

```bash
docker compose -f docker-compose.pi.yml logs -f
```

### 4. When build is done — start bore

```bash
sudo systemctl start bore-web
journalctl -u bore-web -n 20
```

Note the port in the output (e.g. `bore.pub:12345`).

### 5. Use your instance

Open `http://bore.pub:PORT` in your browser and test playback.

### 6. (Optional) Use invidious.popped.dev via Cloudflare Tunnel

To serve at `https://invidious.popped.dev` instead of bore.pub, follow [docs/CLOUDFLARE_TUNNEL_SETUP.md](CLOUDFLARE_TUNNEL_SETUP.md). You can then stop bore.

---

## Quick Commands

| Task | Command |
|------|---------|
| View logs | `docker compose -f docker-compose.pi.yml logs -f` |
| Stop stack | `docker compose -f docker-compose.pi.yml down` |
| Start stack | `docker compose -f docker-compose.pi.yml up -d` |
| Check bore port | `journalctl -u bore-web -n 20` |
