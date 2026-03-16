#!/bin/bash
# BetterInvidious Pi Setup Script (GitHub workflow)
# Run this on your Pi after cloning. Assumes: git clone https://github.com/YOUR_USERNAME/BetterInvidious.git ~/BetterInvidious

set -e

echo "=== BetterInvidious Pi Setup ==="

# 2.1 Update system
echo ">>> Updating system..."
sudo apt update && sudo apt upgrade -y

# 2.2 Install Docker
echo ">>> Installing Docker..."
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker || true

# 2.3 Install tinyproxy
echo ">>> Installing tinyproxy..."
sudo apt install -y tinyproxy
sudo sed -i 's/^Listen .*/Listen 0.0.0.0:3128/' /etc/tinyproxy/tinyproxy.conf
sudo systemctl enable tinyproxy
sudo systemctl start tinyproxy
sudo systemctl status tinyproxy --no-pager

# 2.4 Install bore
echo ">>> Installing bore..."
cd ~
wget -q https://github.com/ekzhang/bore/releases/download/v0.6.0/bore-v0.6.0-aarch64-unknown-linux-musl.tar.gz
tar -xzf bore-v0.6.0-aarch64-unknown-linux-musl.tar.gz
sudo mv bore /usr/local/bin/
rm bore-v0.6.0-aarch64-unknown-linux-musl.tar.gz
bore --version

# 2.5 Build React UI (only if assets/react missing)
if [ ! -f ~/BetterInvidious/invidious/assets/react/index.html ]; then
  echo ">>> Building React UI on Pi..."
  cd ~/BetterInvidious/frontend
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
  npm install
  npm run build
  mkdir -p ../invidious/assets/react
  cp -r dist/* ../invidious/assets/react/
  cd ~
else
  echo ">>> React UI already built (in assets/react)"
fi

# Install bore systemd service
echo ">>> Installing bore systemd service..."
sudo cp ~/BetterInvidious/scripts/pi/bore-web.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable bore-web
# Don't start yet - Docker stack must be up first

echo ""
echo "=== Setup complete. Next steps: ==="
echo "1. Log out and back in (or run: newgrp docker) for Docker group"
echo "2. Start the stack:"
echo "   cd ~/BetterInvidious/invidious"
echo "   docker compose -f docker-compose.pi.yml up -d --build"
echo "3. Wait 45-90 min for first build. Check: docker compose -f docker-compose.pi.yml logs -f"
echo "4. When ready, start bore: sudo systemctl start bore-web"
echo "5. Get your URL: journalctl -u bore-web -n 20"
