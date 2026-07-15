#!/usr/bin/env bash
# Builds the Gokul AI assistant frontend and mounts it at public/assistant/.
# The assistant source lives in its own repo (kept separate on purpose —
# unique UI, public template project). Override the location with:
#   ASSISTANT_DIR=/path/to/portfolio-assistance/frontend ./scripts/build-assistance.sh
set -euo pipefail

PORTFOLIO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ASSISTANT_DIR="${ASSISTANT_DIR:-$PORTFOLIO_DIR/../portfolio-assistance/frontend}"

if [ ! -f "$ASSISTANT_DIR/package.json" ]; then
  echo "Assistant frontend not found at: $ASSISTANT_DIR"
  echo "Set ASSISTANT_DIR to the portfolio-assistance/frontend path."
  exit 1
fi

echo "Building assistant from: $ASSISTANT_DIR"
cd "$ASSISTANT_DIR"
VITE_BASE=/assistant/ VITE_API_BASE=/assistant-api npx vite build

echo "Mounting into: $PORTFOLIO_DIR/public/assistant"
rm -rf "$PORTFOLIO_DIR/public/assistant"
cp -r dist "$PORTFOLIO_DIR/public/assistant"

echo "Done. /assistant is ready — rebuild or restart next dev to pick it up."
