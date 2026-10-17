# Raspberry Pi preview, port 8080

The existing RackVisual installation on port 80 is not modified. The new app has a separate Compose project and does not share its database or Docker volumes.

After cloning the repository, or for subsequent updates:

```bash
cd /home/pi/HomeLab-Command-Center
git pull --ff-only
sudo docker compose -f docker-compose.yml up -d --build
```

Open `http://<SERVER-IP>:8080/` or `http://your-hostname:8080/`, replacing `<SERVER-IP>` with **your own host's IP address**. Port 8080 must be free. The project never requires a specific LAN subnet, IP or hostname.

Stop only this preview with `sudo docker compose -f docker-compose.yml down`.

**Status: experimental preview, not production-ready.** First build requires npm packages and may be memory-intensive on Raspberry Pi hardware. Browser-based rendering runs on the client. This preview stores configuration in browser localStorage; GLB is a session-only import. Live Netdata, durable database migrations, model licensing search, exact surface-raycast port editing and user authentication are not yet implemented. Never publish your actual private inventory in this repository.


Every installation has its own IP addresses, subnet, DNS names and device endpoints. Example addresses are illustrative only; do not hardcode the original developer's LAN address into application logic.
