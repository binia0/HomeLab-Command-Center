# RackVisual migration parity — mandatory checklist

This is the regression checklist for the new HomeLab Command Center. Features below came from the previous RackVisual HomeLab iterations, including stages 1–6. **Do not treat an item as implemented merely because a demo placeholder exists.**

## Rack and geometry
- [ ] Independently configurable 10-inch and 19-inch rack footprints with correct physical mount width, rack depth, U placement, front/back faces
- [ ] Accurate 20U 10-inch rack example, without hardcoding this user's dimensions for other installations
- [ ] Rack tray supports 8 Raspberry Pi boards oriented **VERTICALLY**, side by side in **ONE HORIZONTAL ROW**, four occupied/four empty
- [ ] Two Jetsons side by side and two JetKVMs side by side, each subslot independently selected and configured
- [ ] Empty slots remain visible, editable, and available for future devices
- [ ] Uploaded real GLB files, device models and precise dimensions; keep clickable device/subslot interaction when changing 3D visuals
- [ ] Premium PBR rack geometry, clear realistic hardware and cable visuals, useful zoom, front/back/orbit, physically oriented ports

## Equipment and ports
- [ ] Device models and physical installed device instances are separate records
- [ ] Three identical switches have independently numbered physical ports; occupied port #1 on switch A does NOT occupy port #1 on switch B or C
- [ ] RJ45, USB-A/C, HDMI, power and custom connectors, placed precisely on GLB surfaces via in-GUI 3D editor, with saved local position, normal and orientation
- [ ] Patch panel 12-port, template model 98: **12 RJ45 front and 12 RJ45 rear**, physically separated front/rear keystone pass-through mapping
- [ ] Preserve other existing patch panels and JetKVM patch panel independently (no model/global-identifier edits)
- [ ] Rear view must expose real rear connectors; avoid reversed front/back coordinates

## Cable workflow and GUI
- [ ] Cable mode: click free port A then free port B to create cable; selection is unambiguous
- [ ] Cable mode: click **occupied RJ45 connector** to show in-place remove action, confirm, delete cable and immediately release both ports
- [ ] Same deletion and port availability in rear and front views; available from cable list too
- [ ] Selecting 3D cable highlights it and opens editable inspector details
- [ ] Physically routed cables follow rack/device changes; distinguish front/rear and cable type
- [ ] Ports of identical device models do not share cable occupancy or IDs

## Detail inspector and device management
- [ ] Right-hand inspector shows selected physical device or selected independently addressable Pi/Jetson/JetKVM slot
- [ ] Rich **real** telemetry: CPU, RAM, disks, networking, temperatures, uptime, status/source freshness and any available further metrics (no fictitious readings)
- [ ] Netdata adapter and settings independently configurable per install; optional integrations extensible
- [ ] Multiple named HTTP/HTTPS URLs **per actual device/slot**, storing the complete scheme, hostname/IP, port and path
- [ ] Saved web links always clickable; website edit/add/delete UI **collapsed by default behind small gear icon**, expands only on click, saves persistently
- [ ] Device name, IP, mounting, model, ports and service URLs editable in GUI
- [ ] Configurable LAN IPs; never hardcode the original developer's private IP or host name

## Data migration and release discipline
- [ ] Preserve previous RackVisual installation and its live SQLite/GLB assets; read-only import preview + explicit user confirmation before copying
- [ ] User's per-instance device records, rack ID mapping, cable records and saved URLs migrated without conflating model and instance IDs
- [ ] Backups/restore with validation; reversible migration and versioned schema
- [ ] Pi 3 B+ 1 GB: **prebuilt static frontend** from GitHub Actions, no npm/Vite build on Pi, separate port 8080 from RackVisual on port 80
- [ ] Public repository contains sample data only, with secrets/real LAN data never published
- [ ] Test each milestone in live GUI with user before proceeding; no repeated untested cosmetic patches

## Current preview delivery — 2026-10-17
- Add/Edit Device dialog, including name, U location, height, panel finish, RJ45, USB-A, USB-C, HDMI, power and port deletion, committed. **Prototype only**: no real GLB positional raycast, no persistent backend.
- Rack render improvements: deeper metal chassis, mount screws, ventilation, plinth and distinct connector renderings, committed. Quality must be reviewed in browser after successful GitHub Actions build.
- Full acceptance checklist items above remain unchecked until the user verifies complete behavior.

## Immediate priority
1. Durable GLB model library / persistent uploads in private application storage (no private models in public git).
2. Exact GLB scale/orientation with in-GUI connector editor.
3. Accurate independently selectable multi-slot holders and patch panels.
4. Premium scene improvements without breaking physical interaction.
5. Imported existing rack/devices/ports/cables/websites after verified backups.
