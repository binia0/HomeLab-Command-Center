# Visual quality gate — Silicon-Pirates-inspired rack editor

User-approved reference: the user's Silicon Pirates rack-simulation screenshot and interface. It is a **design benchmark**, not permission to copy proprietary models/assets or claim visual equivalence.

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
