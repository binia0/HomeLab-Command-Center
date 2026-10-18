#!/bin/sh
# Non-destructive smoke check for deployed HomeLab Command Center.
# Does not modify Docker volumes, RackVisual, or rack configuration.
set -eu
cd "$(dirname "$0")"
echo "== Source =="
git rev-parse --short HEAD
echo "== Static checkout =="
if [ -d web-dist/.git ]; then
  git -C web-dist rev-parse --short HEAD
  test -s web-dist/index.html || { echo "FAIL: web-dist/index.html missing"; exit 1; }
else
  echo "FAIL: prebuilt web-dist checkout missing"
  exit 1
fi
echo "== Docker status =="
sudo docker compose ps
api_running="$(sudo docker compose ps --status running --services | grep -cx 'api' || true)"
web_running="$(sudo docker compose ps --status running --services | grep -cx 'web' || true)"
test "$api_running" = 1 && test "$web_running" = 1 || { echo "FAIL: web or api not running"; exit 1; }
echo "== HTTP homepage =="
code="$(curl --max-time 8 --silent --output /tmp/hcc-smoke-home.html --write-out '%{http_code}' http://127.0.0.1:8080/)"
test "$code" = 200 || { echo "FAIL: homepage returned $code"; exit 1; }
grep -qi '<html' /tmp/hcc-smoke-home.html || { echo "FAIL: missing HTML"; exit 1; }
echo "== API =="
response="$(curl --max-time 8 --fail --silent http://127.0.0.1:8080/api/me)"
printf '%s\n' "$response"
printf '%s' "$response" | grep -q '"username"' || { echo "FAIL: API response missing username key"; exit 1; }
echo "PASS: basic deployment smoke check. 3D UI interactions, database restore and authentication still require separate testing."
