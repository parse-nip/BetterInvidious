#!/bin/bash
# Create config/config.yml from example if missing.
# Ensures login_enabled, registration_enabled, check_tables are set for user accounts.

set -e
cd "$(dirname "$0")/../invidious"
CONFIG="config/config.yml"
EXAMPLE="config/config.example.yml"

if [ -f "$CONFIG" ]; then
  echo "config/config.yml already exists. Skipping."
  exit 0
fi

if [ ! -f "$EXAMPLE" ]; then
  echo "Error: config/config.example.yml not found."
  exit 1
fi

cp "$EXAMPLE" "$CONFIG"
echo "Created config/config.yml from example."

# Ensure login, registration, check_tables are enabled
sed -i.bak 's/#login_enabled: true/login_enabled: true/' "$CONFIG" 2>/dev/null || true
sed -i.bak 's/#registration_enabled: true/registration_enabled: true/' "$CONFIG" 2>/dev/null || true
sed -i.bak 's/#check_tables: false/check_tables: true/' "$CONFIG" 2>/dev/null || true
sed -i.bak 's/check_tables: false/check_tables: true/' "$CONFIG" 2>/dev/null || true

# Fix hmac_key if still default
if grep -q 'hmac_key: "CHANGE_ME!!"' "$CONFIG"; then
  NEW_KEY=$(openssl rand -hex 16 2>/dev/null || echo "betterinvidious-dev-key-20ch")
  sed -i.bak "s/hmac_key: \"CHANGE_ME!!\"/hmac_key: \"$NEW_KEY\"/" "$CONFIG"
  echo "Generated new hmac_key."
fi

rm -f "${CONFIG}.bak" 2>/dev/null || true
echo "Done. Edit config/config.yml to set db credentials and domain."
