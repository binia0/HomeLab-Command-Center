# HomeLab Command Center

An open-source, self-hosted **3D homelab infrastructure dashboard**.

**Current status:** experimental 0.1 browser prototype. Not yet production-ready.

## Try it on a Raspberry Pi

The first preview runs **separately on port 8080**. It does not change RackVisual or access its database.

```bash
cd /home/pi
git clone https://github.com/binia0/HomeLab-Command-Center.git
cd HomeLab-Command-Center
sudo docker compose up -d --build
```

Then open **http://<SERVER-IP>:8080/** (replace `<SERVER-IP>` with the IP address or hostname of *your* host; there is no fixed or required IP address). using your own Raspberry Pi or server IP address. More details in [DEPLOY.md](DEPLOY.md).

If already cloned:

```bash
cd /home/pi/HomeLab-Command-Center
git pull --ff-only
sudo docker compose up -d --build
```

## Available in preview 0.1

- Browser-rendered, selectable 3D rack with 10-inch and 19-inch width settings
- Adjustable rack height from 4U to 42U and physical rack-unit positioning
- Front, back and orbit camera controls
- Demonstration slots for 8 vertical SBCs, 2 Jetsons and 2 JetKVMs
- Per-instance RJ45 definitions (identical switches do not share occupied ports)
- Basic RJ45/USB/HDMI/power port editing and in-app cable connect/disconnect at a port
- Device inspector and named full HTTP/HTTPS service URLs behind collapsible settings
- Session-only .glb upload preview for a selected device
- Local browser persistence for demo settings and cable records
- Missing telemetry shown as unavailable, **not** as made-up data

## Next milestones

- Durable backend inventory storage, schema, validation and backup/restore
- Real model library and surface-raycast connector placement with fine 3D gizmos
- Backend GLB persistence, license-aware optional model search and download
- Full actual devices, rack subslots and passthrough patch-panel connector pairing
- Real front/back cables with routed 3D cable geometry
- Netdata live telemetry with source/availability indicators
- Import existing RackVisual data safely, without overwriting it
- Tested Docker image builds and CI pipelines

## Planned architecture

React + TypeScript + Babylon.js frontend, ASP.NET Core service layer, relational database and Docker Compose.

See [architecture](docs/ARCHITECTURE.md), [roadmap](docs/ROADMAP.md) and [real GLB/port specification](docs/3D-ASSETS-AND-PORTS.md).

## Privacy

Do not commit IP addresses, real device inventory, passwords, imported database files or personal model assets into this public repo. The prototype contains only demo-device names.

## License

MIT, see [LICENSE](LICENSE).


Every installation has its own IP addresses, subnet, DNS names and device endpoints. Example addresses are illustrative only; do not hardcode the original developer's LAN address into application logic.
