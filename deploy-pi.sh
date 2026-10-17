#!/bin/sh
# On low-memory Raspberry Pis this script does NOT compile any JavaScript.
set -eu
cd "$(dirname "$0")"
echo "Fetching published, prebuilt web assets from GitHub..."
if [ -d web-dist/.git ]; then
  git -C web-dist pull --ff-only origin static
else
  if [ -e web-dist ]; then
    echo "web-dist exists but isn't a Git checkout; stopping to protect local data." >&2
    exit 1
  fi
  git clone --depth 1 --branch static https://github.com/binia0/HomeLab-Command-Center.git web-dist
fi
test -s web-dist/index.html || { echo "Built index.html missing; check GitHub Actions." >&2; exit 1; }
echo "Starting prebuilt nginx-only preview on port 8080..."
sudo docker compose up -d --no-build
echo "Ready. Open http://<YOUR-SERVER-IP>:8080/"
