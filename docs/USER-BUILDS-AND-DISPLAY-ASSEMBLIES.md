## User accounts and builds

Server-side account system is required, not an in-browser login. Backend: SQLite persisted in Docker volume, scrypt/Argon2id passwords, session cookies, CSRF and rate limiting. Builds include owner_id, name, schema_version, revision, json and timestamps. Every API request authorizes the owner. Asset storage for real photos/GLB must be persistent and private. Existing localStorage data must be exportable and importable with confirmation. Existing RackVisual port 80 stays untouched; deploy web/API behind port 8080 only after tests.

## Display + Raspberry Pi assembly

Display and Pi stay independently editable device instances with distinct ports. A mechanical association anchors the display front and Pi behind, using measured offsets. Electric connections are explicit cables: HDMI/USB/DSI/POWER are never inferred. Delete/unmount behavior preserves linked hardware unless separately confirmed. Need full independent slot occupant entities and exact front/back transforms.

## Required validation

Users A/B have separated builds, data survives reboot, browser local data migrates safely, assemblies persist across reload, two-click RJ45 and display video cables persist and renderer errors display a recoverable error UI. CI must pass before Pi deployment.

Current frontend does not yet implement secure server accounts; this file specifies what to build and test.
