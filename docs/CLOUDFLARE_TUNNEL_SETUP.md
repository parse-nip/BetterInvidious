# Cloudflare Tunnel Setup for invidious.popped.dev

Use a Cloudflare Tunnel to serve BetterInvidious at `invidious.popped.dev` instead of `bore.pub:PORT`. You get a stable URL, free HTTPS, and no port changes.

---

## Prerequisites

1. **Domain on Cloudflare** — `popped.dev` must be added to your Cloudflare account with nameservers pointed to Cloudflare.
2. **Pi Connect** — You'll need browser access for the login step (Pi Connect desktop, or do login on your PC and copy certs).

---

## Part 1: Install cloudflared on the Pi

```bash
# Add Cloudflare's package repo
sudo mkdir -p --mode=0755 /usr/share/keyrings
curl -fsSL https://pkg.cloudflare.com/cloudflare-public-v2.gpg | sudo tee /usr/share/keyrings/cloudflare-public-v2.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/cloudflare-public-v2.gpg] https://pkg.cloudflare.com/cloudflared any main" | sudo tee /etc/apt/sources.list.d/cloudflared.list

# Install
sudo apt-get update && sudo apt-get install -y cloudflared

cloudflared --version
```

---

## Part 2: Authenticate (one-time)

**Option A: Pi Connect desktop (easiest)**

If you have Pi Connect desktop with a browser:

```bash
cloudflared tunnel login
```

A browser window opens. Log in to Cloudflare, select the zone `popped.dev`, and authorize. This creates `~/.cloudflared/cert.pem`.

**Option B: Headless (login on your PC, copy certs)**

1. On your **PC** (Windows), download cloudflared: https://github.com/cloudflare/cloudflared/releases — get `cloudflared-windows-amd64.exe`
2. Run: `.\cloudflared.exe tunnel login`
3. Complete the browser flow and select `popped.dev`
4. Copy the generated cert to your Pi:

```powershell
scp $env:USERPROFILE\.cloudflared\cert.pem user@betterinvidious-proxy.local:~/.cloudflared/
```

5. On the Pi, ensure the directory exists:

```bash
mkdir -p ~/.cloudflared
# cert.pem should now be there if you used scp
```

---

## Part 3: Create the tunnel

```bash
cloudflared tunnel create betterinvidious
```

Note the output:
- **Tunnel ID** (UUID like `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
- **Credentials file path** (e.g. `~/.cloudflared/<UUID>.json`)

Verify:

```bash
cloudflared tunnel list
```

---

## Part 4: Create config file

```bash
nano ~/.cloudflared/config.yml
```

Paste (replace `YOUR_TUNNEL_UUID` with the UUID from Part 3):

```yaml
tunnel: YOUR_TUNNEL_UUID
credentials-file: /home/user/.cloudflared/YOUR_TUNNEL_UUID.json

ingress:
  - hostname: invidious.popped.dev
    service: http://localhost:3000
  - service: http_status:404
```

**Important:** Replace `user` in the path with your actual Pi username (`whoami`). Replace `YOUR_TUNNEL_UUID` with your tunnel UUID in both places.

Save (Ctrl+O, Enter, Ctrl+X).

---

## Part 5: Route DNS

```bash
cloudflared tunnel route dns betterinvidious invidious.popped.dev
```

This creates a CNAME record: `invidious.popped.dev` → `betterinvidious.<your-account>.cfargotunnel.com`.

---

## Part 6: Install as systemd service

Use the full config path (replace `user` with your Pi username from `whoami`):

```bash
sudo cloudflared --config /home/user/.cloudflared/config.yml service install
```

This installs the `cloudflared` systemd service.

---

## Part 7: Start and enable

```bash
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
sudo systemctl status cloudflared
```

---

## Part 8: Stop bore (optional)

You no longer need bore:

```bash
sudo systemctl stop bore
sudo systemctl disable bore
```

---

## Verify

1. Open **https://invidious.popped.dev** in your browser.
2. Search for a video and play it.

---

## Troubleshooting

### "No config file found"
- Ensure `config.yml` is in `~/.cloudflared/`
- Use absolute path: `--config /home/user/.cloudflared/config.yml`

### "Connection refused" or 502
- Ensure Invidious is running: `curl -s http://localhost:3000/api/v1/stats | head -3`
- Restart Docker stack: `cd ~/BetterInvidious/invidious && sudo docker compose -f docker-compose.pi.yml up -d`

### DNS not resolving
- In Cloudflare Dashboard → DNS, confirm `invidious` CNAME exists
- Wait a few minutes for propagation

### Check tunnel logs
```bash
journalctl -u cloudflared -f
```

---

## Quick reference

| Task | Command |
|------|---------|
| Start tunnel | `sudo systemctl start cloudflared` |
| Stop tunnel | `sudo systemctl stop cloudflared` |
| View logs | `journalctl -u cloudflared -f` |
| List tunnels | `cloudflared tunnel list` |
