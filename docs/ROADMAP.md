# HomeLab Command Center — audited roadmap

The project is a working prototype, **not yet a verified v1.0 release**.
[x] means implemented in source, not necessarily tested on the Raspberry Pi.

## Implemented in source
- [x] Browser-rendered Babylon.js rack, 10/19-inch modes and depth presets
- [x] Front/back/orbit camera controls and device inspector
- [x] Local rack editor, multiple independently named devices, panels, slots and displays
- [x] Per-device connectors, cable links and confirmation-based cable deletion
- [x] Named HTTP/HTTPS service URLs with collapsible settings
- [x] Local GLB cache plus optional server persistence
- [x] Server-side rack storage, last 20 revisions and recovery UI
- [x] Netdata CPU/RAM via explicit server-side source allowlist
- [x] Server rack topology/connector validation and basic Python API tests
- [x] GitHub Actions backend smoke-test workflow

## Priority 1 — release blockers
- [ ] Confirm successful frontend build and Python tests on latest commit (local checkout blocked by unavailable GitHub DNS; CI results not independently verified)
- [ ] Test on real low-memory Raspberry Pi: deployment, camera, models, links, permissions
- [ ] Verify external volume backup AND tested SQLite/GLB recovery
- [ ] Replace username-only profiles with verified authentication and secure migration
- [ ] Prevent orphaned GLBs after bulk rack changes and cross-device model ID conflicts
- [ ] Accurate real-model port locations, connector raycasts and transform gizmos (current numeric port XYZ mapping is partial)
- [ ] Resolve model placement/fit for side-by-side independent SBCs and nested slots

## Priority 2 — functionality
- [ ] Cable editing, passthrough patch-panels and physically correct connector pairing
- [ ] Netdata disk/network/temp/uptime with actual chart availability and sample times
- [ ] RackVisual import with read-only source, preview, explicit confirmation and rollback
- [ ] Portable rack backup/export including model assets and version metadata
- [ ] License-aware model discovery/import without unattended third-party downloads

## Priority 3 — polish
- [x] Device name/manufacturer/model/IP search in left equipment panel
- [ ] Better keyboard/mobile ergonomics
- [ ] End-to-end interaction and regression tests
- [ ] Measure Babylon memory and frame times on the target Pi
- [ ] Accessibility, German UI wording and performance tuning

## Operational safety
- RackVisual port 80 and its database must remain untouched.
- Command Center uses port 8080.
- The public repository contains demo data only; never commit real LAN details or credentials.
- A GitHub commit does not automatically install a release on the Pi.
