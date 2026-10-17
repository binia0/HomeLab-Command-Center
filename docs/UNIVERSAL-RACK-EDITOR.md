# Universal Rack Editor — product and technical specification

Status: **approved design direction, implementation pending**. Do not replace current saved user configurations until a tested migration exists.

## First run: an empty rack

A new user starts with a **completely empty rack**. No switches, Raspberry Pis, Jetsons, cables or example inventory silently appears. A separate optional "Load demo rack" action can populate synthetic sample data.

First-run choices:
- rack display name and optional description
- standard **10 inch** or **19 inch**, with correct mounting geometry
- height in rack units (U), depth in mm, optional enclosure and rail adjustments
- optional open-frame, enclosed, wall mounted and shelf configurations
- local save followed by a 3D representation showing the empty rack
- **Edit mode** and **View mode** available at all times, and front/rear/orbit cameras

The editor should work on an empty rack before any model asset is uploaded. It must preserve an empty rack faithfully across reloads.

## Two distinct usage modes

**Edit rack**: select rack, add or remove hardware, panel, shelves, subslots, port positions and cables, assign metadata, edit models. Display snap guides, collisions and real dimensions.

**View / Command center**: rich premium 3D digital twin with selectable individual devices and subdevices. Side inspector shows device name, type, model, network identity, CPU, RAM, disks, temperature, uptime, network traffic, port/cable connections and named web applications. Metrics show unavailable when disconnected; no synthetic telemetry presented as real.

Both modes see the exact same saved inventory and transformations.

## General entity model

- Rack: id, name, width standard, physical dimensions, U height, rails, optional enclosure, units, camera and layout preferences.
- DeviceModel: id, manufacturer, model, metadata, physical dimensions, glb asset and attribution/licence.
- Mount / Panel: id, rackId, templateId?, installation transform, U occupancy, physical clearance, optional GLB asset.
- Slot: id, mountId, local position and orientation, width/height/depth, permitted model families (optional), occupancy, front/rear placement, optional mounting hardware.
- DeviceInstance: id, modelId, parent location (rack or slot), transform relative to parent, hostname/IP, metadata, services, telemetry mappings.
- PortTemplate: id, modelId, type RJ45 / USB-A / USB-C / HDMI / DP / DC / power / custom, model-local position, outward surface normal, orientation.
- PortInstance: id, deviceInstanceId, portTemplateId?, label, instance overrides and type.
- Cable: id, fromPortInstanceId, toPortInstanceId, medium, color, routing control points, connection metadata.
- WebService: id, deviceInstanceId, display name, complete URL with protocol + host + port + path.
- TelemetryMapping: source adapter, endpoint and field mappings, secrets stored outside public code.
- PanelTemplate: reusable layout of positions/constraints, *not* a fixed prebuilt array of Raspberry Pis.

All model, rack, mount, slot, device, and port IDs are independent. Removing a device from a slot leaves the slot and panel intact. Deleting a panel requires handling children and cables explicitly, with warnings/confirmation, never silent cascading deletion.

## Universal panel construction

Any arbitrary number of rows/columns, e.g. 8x1, 4x2, 2x4, plus a free-positioning mode. User can set spacing (mm), per-slot width/height/depth, orientation (portrait/landscape), local position and rotation, and constraints; slots may host **mixed** device models. A row of 8 vertically oriented Pis is just one reusable template. Jetson Orin Nano, mini-PC, JetKVM and other device arrangements use exactly the same system. Allow panels on front, rear and internal rails and mixed-side layouts where physically feasible.

A panel can itself be a proper GLB and define attachment points. A device is represented by its own GLB and maintains its ports as the panel or device moves.

## 3D visual standard

- PBR metallic rails, brackets, mounting screws, actual dimensions; nonblack and two-sided floor with convincing studio stage and lighting.
- Load authentic GLB files with measured physical size and correct orientation, retain local transforms, model preview and persisted library.
- Per-device material properties sourced from the model (multiple independent materials/textures). No single-color replacement for a user-supplied asset.
- Correct physical USB/RJ45/power sockets on the *actual* local surface, placed or adjusted via raycasting and a fine XYZ/rotation gizmo.
- Visually differentiable hardware: PCBs, heatsinks, drive bays, NICs, ports, fasteners, labeling, status lighting.
- Front/back/orbit views, selection, hover labels, object isolation, visibility controls and adequate camera clipping and zoom.
- Routed visible cables attach to physical instance ports; removing a cable directly at an occupied RJ45 works in both front and rear view.
- Performance quality levels for browsers on older systems; browser handles GPU rendering, the Pi 3 B+ only serves assets.
- No broken facade occlusion on rear racks: modules, USB connectors and cables must be accessible.

## In-app lifecycle

1. Create new empty rack → save → view 3D.
2. Create/import Panel/Bracket → choose U, mounting face, orientation and dimensions.
3. Configure slots by grid or individually with physical sizes.
4. Choose model from user GLB library or manually import licensed model; attach independently to each slot.
5. Configure device name, manufacturer/model, IP/hostname, rich web URLs and actual port positions.
6. Cable between independent instance ports; confirm physical compatibility (e.g. never auto-connect HDMI into RJ45).
7. Save persistently and inspect 3D with available telemetry.
8. Delete or change a device without deleting the slot/panel; warn if cables attached.
9. Export, backup and restore, import from existing RackVisual only after verified backup and migration preview.

## Storage and compatibility

Current browser-local storage is **temporary preview storage, not the finished persistence mechanism**. Use a versioned server-backed schema with migrations, backup/export and conflict checks. Configuration may use local address/hostname of each installation; never hardcode the original creator's LAN IP.

The old RackVisual on port 80 must remain untouched while the preview is served on port 8080. Frontend assets must be built on GitHub CI, not on 1-GB Raspberry Pi hardware. Respect older demo data by offering an explicit conversion to the new schema before changing default semantics.

## Required acceptance scenarios

- Fresh browser sees empty 10-inch or 19-inch rack, can save, refresh, and see same empty rack.
- 8x1 vertical holders, 4x2 and custom staggered panels are constructed using identical panel code.
- A panel containing different Pi, Jetson, and KVM devices is editable; each slot is independently selectable.
- Four of eight slots populated, the remaining four empty; deleting one Pi does not delete its mount.
- A rear-mounted Jetson retains visible rear USB and power sockets.
- Three identical switch models each have independent port identities and occupancy.
- Existing patch-panel example has 12 front and 12 rear keystone sockets, with correct logical mapping.
- Existing saved named links retain custom URL ports/paths; small settings gear hidden by default.
- Network/USB/power cables and selected devices retain their correct 3D positions after changing rack camera.
- View mode inspector shows verifiable information only.
- Restart and GitHub-based update preserve inventory, models, cables and rack layouts.

See also [RackVisual parity](RACKVISUAL-PARITY.md) and [GLB and ports](3D-ASSETS-AND-PORTS.md).
