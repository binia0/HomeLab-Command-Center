#!/bin/sh
# Deploy prebuilt assets without compiling on low-memory Raspberry Pi hosts.
set -eu
cd "$(dirname "$0")"
echo "Fetching published, prebuilt web assets from GitHub..."
if [ -d web-dist/.git ]; then
  # GitHub Actions publishes 'static' as an orphan branch, so its history can
  # legitimately diverge on each deployment. web-dist is a generated-only
  # checkout, never the source checkout or application data directory.
  origin="$(git -C web-dist remote get-url origin)"
  branch="$(git -C web-dist branch --show-current)"
  if [ "$origin" != "https://github.com/binia0/HomeLab-Command-Center.git" ] || [ "$branch" != "static" ]; then
    echo "Unexpected web-dist Git repository: refusing to overwrite." >&2
    exit 1
  fi
  if [ -n "$(git -C web-dist status --porcelain)" ]; then
    echo "Local modifications found in generated web-dist directory; refusing to discard them." >&2
    exit 1
  fi
  git -C web-dist fetch --depth 1 origin static
  git -C web-dist reset --hard FETCH_HEAD
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
