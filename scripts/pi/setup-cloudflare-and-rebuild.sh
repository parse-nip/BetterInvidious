#!/bin/bash
# Run on Pi: pulls latest, rebuilds Invidious, installs cloudflared
# Cloudflare login + tunnel create require manual steps (see end of script)
set -e

echo "=== BetterInvidious: Pull + Rebuild + Install cloudflared ==="

cd ~/BetterInvidious
git pull

cd invidious
echo ">>> Rebuilding Invidious (10-30 min with cache)..."
sudo docker compose -f docker-compose.pi.yml up -d --build

if ! command -v cloudflared &>/dev/null; then
  echo ">>> Installing cloudflared..."
  sudo mkdir -p --mode=0755 /usr/share/keyrings
  curl -fsSL https://pkg.cloudflare.com/cloudflare-public-v2.gpg | sudo tee /usr/share/keyrings/cloudflare-public-v2.gpg >/dev/null
  echo "deb [signed-by=/usr/share/keyrings/cloudflare-public-v2.gpg] https://pkg.cloudflare.com/cloudflared any main" | sudo tee /etc/apt/sources.list.d/cloudflared.list
  sudo apt-get update && sudo apt-get install -y cloudflared
fi

echo ""
echo "=== Next: cloudflared tunnel login (opens browser) ==="
