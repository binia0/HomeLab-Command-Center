# Initial architecture

## Web
React/TypeScript UI and Babylon.js rendering: premium rack materials, models, realistic lighting, camera presets, module picking and inspectable cables.

## API
ASP.NET Core handles inventory CRUD, model metadata, validation, telemetry integrations and live updates. The API must never fabricate availability or measurements.

## Domain data
- Rack: name, physical width/depth, U height.
- Mount: physical bracket or tray positioned in rack.
- Slot: a location inside a mount; empty slots persist.
- DeviceInstance: occupant of a slot or individual rack space.
- PortInstance: physical port associated with an actual mount, slot, or device instance; identity never conflates identical switch models.
- Cable: links two specific port instance identifiers, with optional routing points.
- ServiceUrl: many per device, full HTTP/HTTPS scheme, host, port and path.

## Interactions
Clicking a tray shows its individual slots in the right inspector. Clicking a port in Cable mode exposes its current connection and a remove action when occupied. Complete links are normally shown; settings behind a gear icon.

## Privacy and migration
RackVisual remains independently available. Private inventory, IPs, credentials, backups, databases and model assets are not committed to this public repository. Import support will use a private, previewable, reversible migration.

## Performance
Rendering occurs in the user's browser. The new backend is separately hosted under a new port and separate Docker volumes, compatible with limited-memory hosts.
