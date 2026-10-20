#!/bin/sh
# Build the actual main-branch frontend locally if the GitHub static branch is stale.
# Never modify RackVisual, port 80, rack_data, or the tracked web-dist checkout.
set -eu
cd "$(dirname "$0")"
ROOT=$(pwd -P)
echo "HomeLab Command Center — local frontend build"
echo "Source: $(git rev-parse HEAD)"
echo "Building inside a temporary Node 22 container; existing web service stays running."
sudo docker run --rm \
  --user "$(id -u):$(id -g)" \
  -e HOME=/tmp \
  -e npm_config_cache=/tmp/npm-cache \
  -e NODE_OPTIONS=--max-old-space-size=768 \
  -v "$ROOT:/work" -w /work \
  node:22-bookworm-slim sh -eu -c '
    if [ -f package-lock.json ]; then
      npm ci --no-audit --no-fund
    else
      npm install --no-save --package-lock=false --no-audit --no-fund
    fi
    npm run build
  '
test -s "$ROOT/dist/index.html" || { echo "ERROR: Frontend build missing"; exit 1; }
TARGET="$ROOT/web-dist-local"
if [ -e "$TARGET" ] && [ ! -f "$TARGET/.hcc-generated" ]; then
  echo "ERROR: web-dist-local already exists and is not marked as generated. No files changed." >&2
  exit 1
fi
mkdir -p "$TARGET"
cp -a "$ROOT/dist/." "$TARGET/"
touch "$TARGET/.hcc-generated"
git rev-parse HEAD > "$TARGET/.hcc-source-sha"
echo "Starting port 8080 from local build: $(cat "$TARGET/.hcc-source-sha")"
sudo env HCC_STATIC_DIR="$TARGET" docker compose up -d --build
sudo docker compose ps
if command -v curl >/dev/null 2>&1; then
  echo "Checking web and API on port 8080..."
  curl --retry 10 --retry-delay 2 --retry-connrefused -fsS -o /dev/null http://127.0.0.1:8080/
  curl --retry 10 --retry-delay 2 --retry-connrefused -fsS -o /dev/null http://127.0.0.1:8080/api/me
fi
echo "Ready: port 8080 now serves the frontend built from source $(cat "$TARGET/.hcc-source-sha")."
