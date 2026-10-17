# Roadmap

## Foundation
- [x] Repository and initial project documentation
- [ ] Executable skeleton and CI
- [ ] Verify external backup of existing RackVisual

## 3D experience
- [ ] Premium browser-rendered interactive rack, high-quality PBR lighting and chassis
- [ ] GLB import, 3D module picking, selection highlights
- [ ] Front, back, orbit cameras
- [ ] Rich inspector and responsive three-panel command-center layout

## Device management
- [ ] Shared trays with independently selectable slots, including 8 vertical boards side-by-side
- [ ] Independently selectable Jetson and KVM pairs
- [ ] Persistent connections on vacant slots
- [ ] Per-instance switch port occupancy
- [ ] Named full HTTPS/HTTP service URLs with collapsible gear settings

## Cables
- [ ] Front/back routes and physically placed RJ45/power connectors
- [ ] Direct cable removal at occupied RJ45 while in Cable mode
- [ ] Confirm and immediately release both endpoints

## Telemetry
- [ ] Netdata integration and host matching
- [ ] CPU/RAM/storage/network/temperature/uptime when available
- [ ] Explicit missing/offline states and sample timestamps
- [ ] Additional modular device adapters

## Release
- [ ] Data import from RackVisual with preview and rollback
- [ ] Docker Compose, backup/restore, docs, test suite
- [ ] Example data only in public repository
