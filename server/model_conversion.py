"""Small dependency-free binary/ASCII STL to glTF 2.0 converter.
STEP requires an explicitly configured CAD tessellator; never fake a conversion.
"""
import io,json,struct,math

def stl_to_glb(raw:bytes)->bytes:
    triangles=[]
    if len(raw)>=84 and (len(raw)-84)==struct.unpack_from('<I',raw,80)[0]*50:
        count=struct.unpack_from('<I',raw,80)[0]
        if count>300000:raise ValueError('Zu viele Dreiecke')
        for i in range(count):
            values=struct.unpack_from('<12fH',raw,84+i*50)
            triangles.extend((values[3:6],values[6:9],values[9:12]))
    else:
        text=raw.decode('utf-8','strict')
        for line in text.splitlines():
            parts=line.strip().split()
            if len(parts)==4 and parts[0]=='vertex':
                triangles.append(tuple(float(v) for v in parts[1:]))
        if len(triangles)>900000:raise ValueError('Zu viele Dreiecke')
    if not triangles or len(triangles)%3:raise ValueError('Ungültiges STL-Dreiecksnetz')
    if any(not all(math.isfinite(c) for c in p) for p in triangles):raise ValueError('Ungültige Koordinaten')
    # STEP and STL CAD dimensions are normally in millimeters; GLB uses meters.
    coords=[c/1000.0 for vertex in triangles for c in vertex]
    vertices=struct.pack('<%sf'%len(coords),*coords)
    axismin=[min(v[i] for v in triangles)/1000 for i in range(3)]
    axismax=[max(v[i] for v in triangles)/1000 for i in range(3)]
    scene={"asset":{"version":"2.0","generator":"HomeLab STL converter"},"scene":0,
      "scenes":[{"nodes":[0]}],"nodes":[{"mesh":0}],
      "meshes":[{"primitives":[{"attributes":{"POSITION":0},"mode":4}]}],
      "buffers":[{"byteLength":len(vertices)}],
      "bufferViews":[{"buffer":0,"byteOffset":0,"byteLength":len(vertices),"target":34962}],
      "accessors":[{"bufferView":0,"componentType":5126,"count":len(triangles),"type":"VEC3","min":axismin,"max":axismax}]}
    header=json.dumps(scene,separators=(',',':')).encode()
    header+=b' ' * ((-len(header))%4)
    vertices+=bytes([0]) *((-len(vertices))%4)
    length=12+8+len(header)+8+len(vertices)
    return struct.pack('<4sII',b'glTF',2,length)+struct.pack('<I4s',len(header),b'JSON')+header+struct.pack('<I4s',len(vertices),b'BIN'+bytes([0]))+vertices

def step_to_glb(raw:bytes)->bytes:
    """Tessellate STEP through the Gmsh OpenCASCADE kernel in an isolated child process."""
    import subprocess,tempfile,pathlib,sys
    with tempfile.TemporaryDirectory(prefix='hcc-step-') as folder:
        source=pathlib.Path(folder)/'part.step'
        output=pathlib.Path(folder)/'mesh.stl'
        source.write_bytes(raw)
        command=['/usr/bin/python3',str(pathlib.Path(__file__).with_name('step_worker.py')),str(source),str(output)]
        try:
            result=subprocess.run(command,capture_output=True,text=True,timeout=90,check=False)
        except (OSError,subprocess.TimeoutExpired) as exc:
            raise ValueError('STEP-Konvertierung nicht verfügbar oder Zeitlimit überschritten') from exc
        if result.returncode or not output.exists():
            raise ValueError('STEP-Tessellierung fehlgeschlagen: '+result.stderr[-350:])
        return stl_to_glb(output.read_bytes())
