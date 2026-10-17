# Complete functional workflow and invariants

**Design contract, not a claim of implemented functionality.** This document defines the behavior needed for an actually usable self-hosted rack manager. No hardcoded Raspberry-Pi-specific workflows.

## 1. Rack lifecycle
- First start: empty inventory; guided create 10"/19" rack with name, height (U), usable depth, rail positions, enclosure and units. Allow multiple racks and sites, reordering and switching.
- Save, rename, clone rack (with option to omit IPs/cables), export/import, archive and delete with warnings. Saving must work offline in LAN.
- Rack U placement checks *physical interference* by front/rear depth and XY bounds, not only overlapping U ranges. Rear mounted equipment may share U with front equipment if depth permits.
- Rack height/depth edits require preview of incompatible items before committing; never silently drop them.
- Undo/redo, autosave with visible save state, explicit revert, version history and snapshots.

## 2. Flexible physical construction
- Create mount/panel/shelf/rail/tray as physical independent object with width, height, depth, U occupation, transform, front/back/internal side, measured mm dimensions.
- Define slots by rows/columns or free positioning. Per-slot size, offset, orientation, rotation, support constraints and labels; allow mixed devices.
- Reusable panel templates with parameterized count and layout, editable instances and optional detached customization.
- Mount a holder inside a rack, then mount a device inside a holder. Transform must compose parent → slot → device → ports → attached cables. Avoid detached/floating connectors.
- Empty slots remain physically selectable and preserve mounting position. In-use panels cannot be deleted without handling child devices and cables.
- Collision feedback distinguishes actual overlap, design allowance and unsupported arrangement.

## 3. Asset and model library
- Upload GLB/GLTF where supported; inspect dimensions, mesh count, bounding box, axes, scale units, texture list and orientation before committing.
- Keep original model immutable; store a normalized transform separately. Preserve embedded materials/textures and render realistic metal, boards and plastic.
- Find external models only with opt-in, attribution/licence checks and human approval. Don't scrape arbitrary copyrighted assets.
- Model profiles may define default port templates, but instance override edits cannot mutate other instances accidentally.
- Missing/corrupt GLB: warning + explicit temporary fallback and repair/relink tool, never silently pretend a generic box is the real asset.
- Duplicate model detection via content hash; storage quota, backup and cleanup rules.

## 4. Device lifecycle
- Add from library or create custom device; identify manufacturer/model/type, real dimensions, GLB, chosen rack/panel/slot, mount side, orientation, IP/hostname, notes/tags and services.
- Preview before installation, show available U/slots and collisions, then commit atomically.
- Edit/change model, move between racks, unmount without deleting device, remove from slot without deleting holder, replace with another unit, clone without copying physical cable identities.
- Delete device only with explicit cable and dependency review. Offer disconnect first, preserve backup/history, reject silent cascading deletes.
- A single hardware model may appear in multiple independently managed instances. Each instance and port have unique stable IDs.

## 5. Port editor and cable lifecycle
- Supported port families RJ45, USB-A/B/C, HDMI/DP, DC/IEC, serial, fiber/SFP and custom. Connector data includes direction (in/out/bidirectional), media, count, label, front/rear/side and capacity.
- Place ports via surface picking on GLB; choose exact face, local coordinates, outward normal, orientation; fine adjustment in millimeters; save and re-open accurately.
- Separate cable endpoints per instance. Clicking a port lists occupied/free state, endpoint peer, connection type, label and delete/disconnect in Cable mode.
- Create cable with compatibility checks (USB types, network copper/fiber, power, direction), length estimation, color, route points, front/back pathways and clear validation when endpoints are incompatible.
- Preview link before save; refuse multiple cables on a single-connection socket unless adapter/hub explicitly supports it. All port releases atomic.
- Patch panels implement separate front and rear keystone ports + explicit passthrough relationship. Physical patch cords and logical link trace are distinct.
- Cable deletion from port, 3D curve or connection list asks confirmation, releases both endpoints, updates live scene; undo where possible.
- Repositioning devices must recompute visible cable attachment and warn about infeasible new routing, never leave phantom links.
- Network topology is derived from real cable graph, and must not imply IP connectivity from physical cabling alone.

## 6. Network and external web services
- Device can have zero, one or multiple IPv4/IPv6 addresses, DNS aliases and complete HTTP/HTTPS URLs with host, port, path; no fixed local subnet.
- Web service names/categories, open in new tab, optional health checks and authentication metadata without exposing secrets.
- Test-reachability is from **declared probe origin** (browser vs server): don't mark a device offline simply because one observer cannot reach it.
- Service URL editor behind gear by default; saving URL independent of IP address editing.
- SSH/HTTPS/other external actions must be explicit and not turn an inventory record into uncontrolled remote administration.

## 7. Telemetry
- Adapter configuration and per-device mapping for Netdata first, Home Assistant/other adapters later. Support hosts without Netdata and intentionally unknown fields.
- Numeric measurement with timestamp, unit, sample source, state: current/stale/offline/unavailable/error. Never use demonstration values as live readings.
- Inspector sections: CPU, RAM, swap, disks/free space/health, temperatures, power if available, network RX/TX, uptime, OS and device identifiers, alerts and trend graphs.
- Mapping credentials managed separately, secret-free exports. Sensible polling limits, retries, caching and failure isolation.
- Rendering, model library and inventory remain usable when telemetry is down.

## 8. View mode and editing
- Two states: focused premium real-time 3D View, full edit mode with grids, dimensions, hit targets, hierarchy tree, snapping and measurement tools.
- Camera front/back/orbit/top, reset and fit, zoom, isolate, show/hide panels, exploded view if necessary; selection sync across 3D/left inventory/right inspector.
- Accurate object recognition with hover name + mount/slot identity. Accessible list fallback for tiny 3D port targets.
- Clear device/subslot/cable context, not a single generic full-panel edit dialog.
- Rack inspector when empty or selected, device inspector when device selected, cable inspector on link selection.
- Dark studio ground remains visible from low camera angles; back-mounted devices never hidden by a decorative wall.

## 9. Reliability, security and sharing
- Server-backed versioned database plus GLB files in backed-up persistent volume; browser localStorage alone is not acceptable for released product.
- Transactions across device/slot/port/cable mutations; optimistic concurrency checks on simultaneous edits; API validation matching GUI.
- Export and import with preview, stable IDs/remapping, schema versions, data integrity checks, dry run and rollback.
- Authentication/roles when exposed beyond a trusted LAN, HTTPS through configurable reverse proxy, no default public admin credentials.
- Logs and actionable errors, auto-recoverable deployment, health endpoint, backup/restore and documented upgrades. Do not delete persistent user files in Docker down/rebuild.
- Installation on 1-GB Pi 3 B+: download CI-prebuilt static frontend and light server; rendering on client GPU; separate :8080 preview from existing app.
- Public repo must never contain private LAN IPs, hostnames, telemetry secrets, GLBs without redistribution rights or personal inventory.

## 10. Critical cross-feature tests (must be automated)
1. Create empty 10" rack, save, reload; empty rack persists. Same for 19" and custom dimensions.
2. Make panel 8x1 vertical, panel 4x2, custom free arrangement; mix Pi, Jetson, JetKVM, server devices; reload.
3. Move a complete panel with devices: all instance transforms, ports and connected cables follow and retain unique IDs.
4. Front U10 and rear U10 both occupied if physically clear, reject actual collision.
5. Same model installed three times has independent RJ45 port #1 state.
6. Attach RJ45 cable, remove directly at RJ45, both ports free after reload; same operation on rear.
7. Front/back patch-panel passthrough with 12 separate front and 12 rear RJ45 ports.
8. Model GLB upload preserves multi-material textures and physical orientation, correct USB and Ethernet placement.
9. Unmount one Pi from 8x1 rack holder: holder and other seven slots preserved.
10. Save several web services with different ports and paths; no URL corruption; no unintended HTTP-only assumptions.
11. No fabricated telemetry; unavailable remains explicit after adapter outage.
12. Deleting parent panel warns about descendants; backups and rollback prevent unintentional loss.
13. Upgrades and GitHub static-branch refresh never reset data or change the existing app on port 80.
14. Users with other IP ranges, rack sizes and layouts can install without changing source code.

## Priorities: implementation order
P0: persistence and migration safety, truly empty rack creation, racks and physical hierarchy.
P1: universal panels, slots, mount constraints, CRUD and undo.
P2: actual GLB library and precise 3D transforms and connectors.
P3: reliable cable graph including USB/power and patch-panel behavior.
P4: rich right inspector and external service URLs, real Netdata monitoring.
P5: 3D polish, performance, access control, import/export and release hardening.

**Stage gates:** require successful CI, real GUI test and user confirmation before migrating existing RackVisual data.
