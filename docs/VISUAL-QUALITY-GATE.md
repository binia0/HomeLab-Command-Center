# Visual quality standards for HomeLab Command Center

Goal: a professional, detailed, interactive rack editor with crisp hardware geometry, realistic cables, intuitive camera focus, and clearly organized device controls. Do not copy proprietary models or assets.

## Non-negotiable visual characteristics
- Photorealistic / physically believable hardware proportions: rails, chassis, real switch faces, ventilation, fasteners, proper material response, textured plastic, metal, PCB details.
- Crisp rendering: no heavy bloom, fog, arbitrary cyan glow, blurred backgrounds or neon sci-fi aesthetic.
- Neutral studio lighting with controlled highlights, contact shadows, legible details, front/rear/orbit camera presets.
- Correct scale and positioning: 10-inch/19-inch rack geometry, 44.45 mm per rack unit, per-device measured W/H/D, port location derived from actual device model, cable routing through real rear/front paths.
- Individual photographic previews and GLB/GLTF hardware where licensed. Distinguish accurate assets from procedural placeholders. No generic box passed off as a real Raspberry Pi or Jetson.
- A single slot can contain multiple independent devices (e.g., front display with rear Pi), separately editable and cabled.
- Professional UI: high contrast, readable typography, aligned grid, accessible dialogs, restrained colors, generous interaction hit areas.
- Prioritize actual centered 3D rack scene; cosmetic CSS improvements do **not** meet the visual quality bar.

## Acceptance before describing it as finished
1. Capture screenshot of reference and current scene at equivalent framing; review side by side. Ask user for approval.
2. Render at least Pi, Jetson, RJ45 switch, display+Pi assembly with recognizably distinct visuals.
3. Verify front, back, orbit, zoom, port selection and cables visually.
4. No blank screen on template switching; mount/unmount/edit/delete/reload must work.
5. Existing user rack data retained; server/account services tested in LAN prior to rollout.
6. No release claims based solely on passing TypeScript/CSS edits. Real browser screenshot required.

Current procedural Babylon boxes and generated mesh details do **not** yet satisfy this gate. Keep this fact explicit.

## Rack and equipment dimensions: mandatory
- 10-inch / 19-inch specifies **nominal rack mounting width**, not rack depth. A 19-inch rack has mounting width 482.6 mm; do not assume this is its depth or usable interior width.
- Configure rack depth independently in millimeters (e.g. 450, 600, 800, 1000, 1200 mm) and support custom dimensions. Specify whether depth denotes outer cabinet depth or rail-to-rail mounting depth; do not conflate them.
- Configure usable installation depth, front and rear rail positions, equipment clearances and door/panel clearance separately where relevant.
- Each device records physical width, height and depth in millimeters, U height (1U = 44.45 mm), weight and front/rear mounting; enforce fit checks and warn if equipment exceeds usable depth or width.
- Offer real rackmount equipment: 1U/2U/3U/4U servers, storage servers/NAS, UPS, PDUs, switches, patch panels, routers, mini PCs, Jetson boards, Raspberry Pis, KVMs, monitors and user-defined hardware; device library must never be restricted to Raspberry Pi.
- Server equipment should have identifiable chassis sizes, rack ears, drive bays, fan grilles, NIC ports and front/back details when models/assets are available.
- Keep each physical device editable independently, and permit multiple devices in a slot or one mechanical assembly as long as fit and collision constraints allow.
- Test 19-inch x 42U x 1000 mm rack with a deep 2U server and a short switch; verify physical depth and camera views visibly distinguish them.
