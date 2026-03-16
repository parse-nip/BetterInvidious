# Route Companion Through Your PC (or Raspberry Pi)

Use your PC's residential IP as the proxy until you move to your Raspberry Pi. Same steps apply to the RPi later.

## Quick start (automated)

From the project root (requires Node.js — uses built-in proxy, no trojan warnings):

```powershell
# 1. Setup (downloads bore + cloudflared; Node.js proxy is bundled)
.\scripts\setup-cloudflare-proxy.ps1

# 2. Run proxy + bore tunnel (supports HTTP CONNECT — required for video playback)
.\scripts\run-bore-proxy.ps1
```

Keep the run script window open while using BetterInvidious. Press Enter to stop.

**Important:** Use `run-bore-proxy.ps1`, not `run-cloudflare-proxy.ps1`. Cloudflare Quick Tunnel does **not** support HTTP CONNECT, so video playback will fail. Bore is a raw TCP tunnel and works correctly.

**If bore is blocked by Windows Defender:** Add an exclusion for `scripts\proxy-tools`, or use port forwarding instead: `.\scripts\run-proxy-portforward.ps1` (see Option B).

---

## Manual setup (if scripts don't work)

## Overview

```
Companion (Fly.io)  →  Your PC (proxy)  →  YouTube
                         ↑
                   Residential IP ✓
```

You need:
1. An **HTTP proxy** running on your PC
2. A way for Fly.io to **reach** your PC (tunnel or port forward)

---

## Option A: Bore TCP tunnel (recommended, no port forward)

No router changes. Bore creates a raw TCP tunnel — **supports HTTP CONNECT** (unlike Cloudflare Quick Tunnel).

### 1. Install bore

Run the setup script, or download: https://github.com/ekzhang/bore/releases — get `bore-v*-x86_64-pc-windows-msvc.zip`

### 2. Install gost or use Node.js proxy

**Node.js (recommended):** The bundled `simple-proxy.js` works with no extra downloads.

**Or gost:** Download from https://github.com/go-gost/gost/releases — get `gost_*_windows_amd64.zip`

Run the proxy on port 3128 (see `run-bore-proxy.ps1` for the full flow).

### 3. Start bore tunnel

```powershell
bore local 3128 --to bore.pub
```

You'll see output like:
```
listening at bore.pub:35429
```

### 4. Set PROXY on the companion

```powershell
fly secrets set PROXY="http://bore.pub:35429" -a betterinvidious-companion

cd invidious
fly deploy -c companion/fly.toml -a betterinvidious-companion
```

### 5. Keep both running

- **Proxy** must stay running (Node.js or gost)
- **bore** must stay running (the tunnel)

**Important:** The bore port changes every time you restart. If you restart, run `fly secrets set PROXY="http://bore.pub:NEW_PORT"` and redeploy.

When you move to your RPi, run bore + proxy there instead.

---

## Option A2: Cloudflare Tunnel (does NOT support CONNECT)

Cloudflare Quick Tunnel forwards HTTP requests but **does not support HTTP CONNECT**. Video playback will fail with "unsuccessful tunnel" or "400 Bad Request". Use bore (Option A) instead.

---

## Option B: Port forward (if you can edit your router)

If you can forward a port from your router to your PC, no tunnel needed. **Works when bore is blocked by antivirus.**

### 1. Start the proxy

```powershell
.\scripts\run-proxy-portforward.ps1
```

Or manually with gost: `.\gost.exe -L :3128`

### 2. Forward port on your router

Forward external port **3128** (or any port) → your PC's local IP:3128.

Find your PC's IP: `ipconfig` (look for IPv4 under your adapter).

### 3. Get your public IP

Visit https://whatismyip.com or run:
```powershell
(Invoke-WebRequest -Uri "https://api.ipify.org").Content
```

If your IP changes (dynamic), use a free dynamic DNS: [DuckDNS](https://www.duckdns.org/) or [No-IP](https://www.noip.com/).

### 4. Set PROXY

```powershell
# Replace with your public IP or DuckDNS hostname
fly secrets set PROXY="http://YOUR_PUBLIC_IP:3128" -a betterinvidious-companion
# Or: fly secrets set PROXY="http://yoursubdomain.duckdns.org:3128" -a betterinvidious-companion

cd invidious
fly deploy -c companion/fly.toml -a betterinvidious-companion
```

---

## Option C: ngrok (alternative tunnel)

```powershell
# Install: winget install ngrok.ngrok
ngrok http 3128
```

Use the HTTPS URL ngrok gives you (e.g. `https://abc123.ngrok-free.app`). Some proxy clients work better with the direct TCP option — ngrok paid has `ngrok tcp 3128`. Free HTTP tunnel may work; if CONNECT fails, use Cloudflare Tunnel instead.

```powershell
fly secrets set PROXY="http://abc123.ngrok-free.app:443" -a betterinvidious-companion
```

---

## Moving to Raspberry Pi

**Option 1: Pi as proxy only** (keep Fly.io for Invidious) — same setup on the RPi:

1. Install gost (or tinyproxy): `sudo apt install tinyproxy` or download gost for arm64
2. Configure tinyproxy to listen on `0.0.0.0:3128` (edit `/etc/tinyproxy/tinyproxy.conf`)
3. Use Cloudflare Tunnel or port forward from your router to the RPi
4. Update the PROXY secret with the RPi's tunnel URL or public IP

The RPi at home has a residential IP, so YouTube will accept requests.

**Option 2: Run everything on the Pi** (no Fly.io) — see [docs/PI_FULL_SETUP.md](PI_FULL_SETUP.md).

---

## Troubleshooting

- **"unsuccessful tunnel" or "400 Bad Request":** Cloudflare Quick Tunnel does not support HTTP CONNECT. Use bore (`run-bore-proxy.ps1`) instead.
- **PROXY format:** Use `http://bore.pub:PORT` for bore. Some clients expect `http://` even for HTTPS proxies.
- **Tunnel drops:** Bore and Cloudflare URLs/ports change on restart. Update the PROXY secret and redeploy.
- **gost not found:** Ensure you're in the directory where you extracted gost, or add it to your PATH. Or use Node.js (bundled proxy).

---

## Security note

The proxy is only used for outbound YouTube requests. Restrict access if you use port forward:

- **gost with auth:** `gost -L user:password@:3128` — then `PROXY="http://user:password@host:port"`
- **Firewall:** Only allow the Fly.io IP ranges (or use a tunnel to avoid exposing the port)

Cloudflare Tunnel doesn't expose your home IP; only the tunnel endpoint is public.
