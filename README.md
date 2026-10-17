# HomeLab Command Center

An open-source, self-hosted **3D infrastructure command center** for real homelabs.

> **Project status:** Early development; not yet an installable application.

## What we're building

- Premium 3D rack scene with front, back and freely orbiting views
- Importable GLB device models, direct interaction and detailed device inspector
- Accurate per-device RJ45 and power ports; visible front/back cable routing
- Cable removal by clicking an occupied port in Cable mode
- Mount trays with individually selectable slots, including empty slots
- Multiple named, full HTTP/HTTPS service URLs per device, with settings hidden behind a small gear icon
- Live CPU, RAM, storage, network, temperature and uptime via integrations such as Netdata
- Local-first Docker deployment, without mandatory cloud services

## Planned architecture

- **Frontend:** React, TypeScript and Babylon.js
- **Backend:** ASP.NET Core
- **Persistence:** Versioned relational data model
- **Deployment:** Docker Compose

The 3D scene is rendered in the browser, reducing resource demands on the host.

Read the [architecture](docs/ARCHITECTURE.md) and [roadmap](docs/ROADMAP.md).

## Data safety

The existing RackVisual installation continues independently. This repository must not contain private network addresses, credentials, imported databases, backups, or user-specific device inventories. Example data will be synthetic.

## License

[MIT](LICENSE). Contributions are welcome as the project takes shape.
