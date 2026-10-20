"""Regression check: STL -> GLB produces valid chunk headers and bounded coordinates."""
import struct
import unittest
import json
from model_conversion import stl_to_glb

class ConversionTests(unittest.TestCase):
    def test_ascii_stl_roundtrip(self):
        stl=b'''solid simple
facet normal 0 0 1
 outer loop
  vertex 0 0 0
  vertex 85 0 0
  vertex 0 56 0
 endloop
endfacet
endsolid simple
'''
        glb=stl_to_glb(stl)
        self.assertEqual(glb[:4],b'glTF')
        self.assertEqual(struct.unpack_from('<I',glb,4)[0],2)
        self.assertEqual(struct.unpack_from('<I',glb,8)[0],len(glb))
        self.assertEqual(glb[16:20],b'JSON')
        json_len=struct.unpack_from('<I',glb,12)[0]
        bin_offset=20+json_len
        self.assertEqual(glb[bin_offset+4:bin_offset+8],b'BIN'+bytes([0]))
        self.assertEqual((len(glb)-bin_offset-8)%4,0)
    def test_step_axes_map_depth_to_z_and_height_to_y(self):
        stl=b'''solid part
facet normal 0 0 1
 outer loop
  vertex 0 0 0
  vertex 483 0 0
  vertex 0 384 44
 endloop
endfacet
endsolid part
'''
        glb=stl_to_glb(stl,cad_z_up=True)
        size=struct.unpack_from('<I',glb,12)[0]
        metadata=json.loads(glb[20:20+size])
        position=metadata['accessors'][0]
        self.assertEqual(position['max'],[0.483,0.044,0.0])
        self.assertEqual(position['min'],[0.0,0.0,-0.384])
    def test_reject_bad_mesh(self):
        with self.assertRaises(ValueError):
            stl_to_glb(b'solid empty\nendsolid empty')

if __name__=='__main__':
    unittest.main()
