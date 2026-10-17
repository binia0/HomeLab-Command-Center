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
