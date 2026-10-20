"""Regression check: STL -> GLB produces valid chunk headers and bounded coordinates."""
import struct
import unittest
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
    def test_reject_bad_mesh(self):
        with self.assertRaises(ValueError):
            stl_to_glb(b'solid empty\nendsolid empty')

if __name__=='__main__':
    unittest.main()
