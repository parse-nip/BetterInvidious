#!/bin/sh
# Build React UI and copy to Invidious assets
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/../frontend"
TARGET_DIR="$SCRIPT_DIR/../invidious/assets/react"

echo "Building React frontend..."
cd "$FRONTEND_DIR"
npm run build

echo "Copying build to $TARGET_DIR..."
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"
cp -r dist/* "$TARGET_DIR/"

echo "Done. React UI is at $TARGET_DIR"
