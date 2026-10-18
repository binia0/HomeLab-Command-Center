import unittest
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from rack_validation import valid_rack_document

def rack():
    return {'rack':{'width':10,'units':8,'depthMm':450,'devices':[
        {'id':'switch','name':'Switch','u':2,'height':1,'ports':[{'id':'lan1','type':'RJ45','x':0,'y':0,'z':-1}]},
        {'id':'pi','name':'Pi','u':4,'height':1,'ports':[{'id':'eth0','type':'RJ45','x':0,'y':0,'z':-1}]}
    ]},'cables':[{'a':'switch/lan1','b':'pi/eth0'}],'services':{}}

class RackValidationTest(unittest.TestCase):
    def test_valid(self):
        self.assertTrue(valid_rack_document(rack()))
    def test_invalid_port(self):
        obj=rack();obj['cables'][0]['b']='pi/missing'
        self.assertFalse(valid_rack_document(obj))
    def test_duplicate_occupancy(self):
        obj=rack();obj['cables'].append({'a':'switch/lan1','b':'pi/eth0'})
        self.assertFalse(valid_rack_document(obj))
    def test_duplicate_device(self):
        obj=rack();obj['rack']['devices'][1]['id']='switch'
        self.assertFalse(valid_rack_document(obj))
    def test_out_of_bounds(self):
        obj=rack();obj['rack']['devices'][0]['u']=9
        self.assertFalse(valid_rack_document(obj))
    def test_invalid_coordinate(self):
        obj=rack();obj['rack']['devices'][0]['ports'][0]['x']=float('nan')
        self.assertFalse(valid_rack_document(obj))

if __name__=='__main__':
    unittest.main()
