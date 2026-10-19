"""Gmsh OpenCASCADE STEP tessellation worker; process runs with a 90-second cap."""
import sys
import gmsh

def convert(source, output):
    gmsh.initialize()
    try:
        gmsh.option.setNumber('General.Terminal',0)
        gmsh.model.add('equipment')
        entities=gmsh.model.occ.importShapes(source)
        if not entities:raise RuntimeError('Keine CAD-Geometrie')
        gmsh.model.occ.synchronize()
        # Bound geometric detail for browser/rack viewport performance.
        gmsh.option.setNumber('Mesh.MeshSizeMin',0.4)
        gmsh.option.setNumber('Mesh.MeshSizeMax',2.0)
        gmsh.option.setNumber('Mesh.Algorithm',6)
        gmsh.model.mesh.generate(2)
        gmsh.write(output)
    finally:
        gmsh.finalize()

if __name__=='__main__':
    try:convert(sys.argv[1],sys.argv[2])
    except Exception as exc:
        print(str(exc),file=sys.stderr)
        sys.exit(1)
