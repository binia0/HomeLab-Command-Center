# Verified manufacturer CAD sources

The HomeLab Command Center does not bundle third-party CAD assets without confirming distribution rights.

## Raspberry Pi 5
- Official Raspberry Pi product information portal: https://pip.raspberrypi.com/categories/892-raspberry-pi-5
- Provides **rpi-5 3D STEP – No Graphics** and **With Graphics** archives.
- Download the archive from Raspberry Pi, extract the STEP, then upload in the device's CAD library.
- The source identifies the Pi 5 specifically. Do not label the same model Pi 3/4.

## Raspberry Pi documentation
- Official hardware schematics/mechanical resources: https://www.raspberrypi.com/documentation/computers/raspberry-pi.html
- Mechanical drawings and STEP availability depend on model.

## Other equipment
For switch, Synology NAS, Dell server, and CyberPower UPS, obtain the exact model and revision before choosing a CAD file. A visually similar model is not proof of a correct chassis or connector arrangement. Check the manufacturer/distributor license before redistributing assets.

## Import behavior
- GLB is loaded directly.
- STL is triangulated and stored as GLB.
- STEP/STP is tessellated on the server with Gmsh/OpenCASCADE, and the resulting GLB is stored in the authenticated library.
- Conversion loses parametric/assembly semantics, textures, and some material distinctions. Connector mapping must still be verified per real model.
- User-provided files are not committed to this public repository.

## Raspberry Pi 4 Model B — CC0 reconstruction
- Source: https://www.innerscene.com/tools/library/3d-parts/raspberry-pi-4-model-b-layout-821bd96d
- CAD STEP published under CC0 by Innerscene, original dimension-based reconstruction; **not** an official Raspberry Pi manufacturer CAD file.
- Server import: POST /api/library/import-raspberry-pi-4 (authenticated).
- Models must be assigned to individual Pi 4 devices. A four-Pi carrier is a separate mechanical assembly; never interpret one Pi PCB model as the entire carrier.
- Real rack still requires vendor-specific assets for the switches, NAS, Dell server and UPS and correct mounting/origin transforms.
