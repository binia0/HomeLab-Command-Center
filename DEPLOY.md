# Raspberry Pi preview, port 8080

The existing RackVisual installation on port 80 is not modified. The new app has a separate Compose project and does not share its database or Docker volumes.

After cloning the repository, or for subsequent updates:

```bash
cd /home/pi/HomeLab-Command-Center
git pull --ff-only
sudo docker compose -f docker-compose.yml up -d --build
```

Open http://192.168.1.211:8080/ . Port 8080 must be free.

Stop only this preview with `sudo docker compose -f docker-compose.yml down`.

**Status: experimental preview, not production-ready.** First build requires npm packages and may be memory-intensive on Raspberry Pi hardware. Browser-based rendering runs on the client. This preview stores configuration in browser localStorage; GLB is a session-only import. Live Netdata, durable database migrations, model licensing search, exact surface-raycast port editing and user authentication are not yet implemented. Never publish your actual private inventory in this repository.
