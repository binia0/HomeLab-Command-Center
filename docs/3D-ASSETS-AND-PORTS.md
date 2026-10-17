# Real GLB models and physical connector placement

## Non-negotiable behavior
1. Upload an actual device model in **GLB / binary glTF** format from the GUI. No generic cuboid replaces an uploaded model.
2. Support finding candidate models on the web **with source URL, licensing and user approval**. Never silently download or redistribute copyrighted assets. If no licensed model exists, say so and allow user upload.
3. Show the loaded GLB on the rack with correct physical width/height/depth, orientation and front/rear alignment.
4. Provide a fully in-app **Port Editor**. In Edit Ports mode, the user orbits/zooms the device and clicks a visible mesh surface to place a port at that precise position.
5. Allow RJ45, USB-A, USB-C, HDMI, DisplayPort, DC power, IEC and custom connectors. Each port has a label, direction, protocol, optional matching template, and both 3D position and surface-facing normal.
6. Save positions in **model-local coordinates**: local position and normal relative to a defined model root/transform. When device instance translates/scales/rotates, transform both by the exact same model matrix.
7. Support snapping to surfaces and a fine adjustment gizmo (X/Y/Z in mm, local mesh-relative). Always distinguish between actual device dimensions and GLB arbitrary authoring units.
8. When the same model is used for 3 switches, reuse its connector geometry template but instantiate **distinct port identities** for each physical unit and persist cables per port instance.
9. Show an occupied RJ45/USB/power port with its connected cable; in Cable mode allow disconnect directly from the port with confirmation and immediate release of BOTH physical endpoints.
10. Front and rear access, connectors behind patch panels, and passthrough pairs must have independent physical front/rear port records plus the relevant logical mapping.
11. Edits are persistent across restarts and supported by versioned import/export. Imported model metadata and ports are not hardcoded to any particular user's inventory.

## Suggested model fields
- DeviceModel: id, name, source, license, attribution, glbPath, bboxMm, nativeUnitsPerMeter, coordinateFrame.
- PortTemplate: id, modelId, name, connectorType, localPositionMeters[3], localNormal[3], localQuaternion[4], faceHint, meshName.
- DeviceInstance: id, modelId, instanceMatrix, rackMountOrSlot, telemetry mapping.
- PortInstance: id, deviceInstanceId, portTemplateId, overrideTransform?, customLabel?.
- Cable: id, portInstanceA, portInstanceB, appearance, optional route/control points.

## Acceptance tests
- Uploaded GLB must appear exactly, not be replaced by generic geometry.
- Click front RJ45 on 8-port switch, save coordinates, restart, and verify identical placement.
- Rotate device 180 degrees, confirm port and cable endpoint follow the transform.
- Three identical 8-port switches can each connect physical port #1 independently.
- Ports can be placed on rear and on side surfaces, including USB and power.
- Cable removal in Cable mode frees both port-instance IDs and persists on reload.
- Offline GLB import works without external search services.
- Web search is optional, license-aware, and cannot be a dependency for normal rack operation.
