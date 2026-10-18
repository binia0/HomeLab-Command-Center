# HomeLab Command Center

An open-source, self-hosted **3D homelab infrastructure dashboard**.

**Current status:** experimental 0.1 browser prototype. Not yet production-ready.

## Try it on a Raspberry Pi

The first preview runs **separately on port 8080**. It does not change RackVisual or access its database.

```bash
cd /home/pi
git clone https://github.com/binia0/HomeLab-Command-Center.git
cd HomeLab-Command-Center
sh deploy-pi.sh
```

Then open **http://<SERVER-IP>:8080/** (replace `<SERVER-IP>` with the IP address or hostname of *your* host; there is no fixed or required IP address). using your own Raspberry Pi or server IP address. More details in [DEPLOY.md](DEPLOY.md).

If already cloned (the Pi only downloads prebuilt files, no Node.js build):

```bash
cd /home/pi/HomeLab-Command-Center
git pull --ff-only
sh deploy-pi.sh
```

## Available in preview 0.1

- Browser-rendered, selectable 3D rack with 10-inch and 19-inch width settings
- Adjustable rack height from 4U to 42U and physical rack-unit positioning
- Front, back and orbit camera controls
- Demonstration slots for 8 vertical SBCs, 2 Jetsons and 2 JetKVMs
- Per-instance RJ45 definitions (identical switches do not share occupied ports)
- Basic RJ45/USB/HDMI/power port editing and in-app cable connect/disconnect at a port
- Device inspector and named full HTTP/HTTPS service URLs behind collapsible settings
- GLB imports cached locally in IndexedDB and synchronised to the authenticated backend when available (maximum 20 MB per model)
- Local browser persistence for demo settings and cable records
- Missing telemetry shown as unavailable, **not** as made-up data

## Next milestones

- Full server-side rack schema validation, external backup export and disaster-recovery testing (version history is implemented)
- Real model library and surface-raycast connector placement with fine 3D gizmos
- License-aware optional model search/download and model removal in the UI
- Full actual devices, rack subslots and passthrough patch-panel connector pairing
- Real front/back cables with routed 3D cable geometry
- Netdata live telemetry with source/availability indicators
- Import existing RackVisual data safely, without overwriting it
- Tested Docker image builds and CI pipelines

## Planned architecture

React + TypeScript + Babylon.js frontend, ASP.NET Core service layer, relational database and Docker Compose.

See [architecture](docs/ARCHITECTURE.md), [roadmap](docs/ROADMAP.md) and [real GLB/port specification](docs/3D-ASSETS-AND-PORTS.md).

## Storage and recovery status (October 2026)

- Saved racks use the SQLite backend and retain the last 20 previous versions when overwritten. Use **Versionen** under the rack account menu to load an older version, then save it as the current rack.
- Imported GLB files are cached in the browser and uploaded to the authenticated API if a user session exists. Without a successful server upload they remain **local to that browser**. A different browser can fetch a model by the same device ID when authenticated as the same user.
- GitHub source commits do not automatically update a running Pi. Deploy only after the frontend build has succeeded and take an external backup of the Docker rack data volume.
- The current username-only profile selector does **not provide secure authentication**. Restrict port 8080 to your trusted private LAN; do not forward it to the internet.
- Not yet completed: live Netdata telemetry, reliable RackVisual import with rollback, production-ready external backup/restore, raycast/drag gizmos, license-aware remote asset catalog, and comprehensive automated tests.

## Privacy

Do not commit IP addresses, real device inventory, passwords, imported database files or personal model assets into this public repo. The prototype contains only demo-device names.

## License

MIT, see [LICENSE](LICENSE).


Every installation has its own IP addresses, subnet, DNS names and device endpoints. Example addresses are illustrative only; do not hardcode the original developer's LAN address into application logic.


### Raspberry Pi 3 / 1 GB RAM

**Do not run `docker compose build`.** GitHub Actions builds the frontend and publishes the `static` branch. `sh deploy-pi.sh` downloads the finished website and starts Nginx with no JavaScript compilation. Wait until the latest Actions run succeeds before the first deploy.
