# Installation on low-memory Raspberry Pi (1 GB supported)

**No npm, Vite, TypeScript or Docker image compilation on the Raspberry Pi.**

The GitHub Actions pipeline builds frontend assets on GitHub's hosted runner and pushes them to the automatically generated `static` branch. The Pi only downloads those files and starts a small, ready-made Nginx image.

## First installation / updating

```bash
cd ~/HomeLab-Command-Center
git pull --ff-only
sh deploy-pi.sh
```

The first deploy requires a successful GitHub Actions run that published the `static` branch. You can check this on the repository's Actions tab. The script stops with a clear message if assets do not exist yet.

Open **http://<SERVER-IP>:8080/**, replacing `<SERVER-IP>` with the actual address of **your** server. No fixed subnet or address is required. Ensure port 8080 is available.

## Stop only the new preview

```bash
cd ~/HomeLab-Command-Center
sudo docker compose down
```

RackVisual on port 80 is never changed. This preview is experimental, stores demo data in browser storage, and isn't production ready. Private inventory and real IPs must not be committed.

## Netdata integration (opt-in)

The server performs all requests. The browser cannot request arbitrary external hosts.
Configure only trusted Netdata agents using an environment variable; the map keys must match
the device IP/host entered in the rack editor.

Create a `.env` file next to `docker-compose.yml` (keep it private and out of Git):

```dotenv
HCC_NETDATA_SOURCES={"sample-host.local":"http://sample-host.local:19999"}
```

Replace both occurrences of `sample-host.local` with the host you actually use.
For an actual machine, enter that same host/IP in the device editor. This mapping is **not**
automatically inferred from the device's IP; only entries in the explicit allowlist can
be polled. The configured Netdata address must be reachable *from inside the API container*.
After changing configuration, apply `sudo docker compose up -d`.

The inspector polls every 15 seconds and displays verified CPU and RAM percentage readings
when the respective Netdata charts are available. Disk and network data remain unavailable,
rather than showing invented values. Netdata query format is the API v1 JSON response.
Do not expose Netdata or this service to untrusted networks. Avoid proxy URLs and redirects.

## Consistent SQLite backup (rack data, versions, GLB assets)

The API stores saved racks, revisions and uploaded GLBs in the named Docker volume
`rack_data`. Before updates or hardware maintenance, make a consistent backup:

```sh
cd ~/HomeLab-Command-Center
sudo docker compose exec api python /app/backup.py /data/backups
```

Backups remain in the Docker volume by default; **copy them to another drive/host**.
A backup that stays on the same Pi/SD card does not protect against disk failure.

To restore manually, stop Command Center first, preserve the existing database,
replace `/data/hcc.sqlite3` with the desired backup and then restart the API.
Restore must be tested on a disposable copy before production use; do not overwrite
the live rack database without a second external backup.

The included command verifies SQLite integrity but is not a complete, automated
off-device disaster recovery system.
