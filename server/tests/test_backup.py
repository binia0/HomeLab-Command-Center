import sqlite3
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from backup import backup

class BackupTest(unittest.TestCase):
    def test_backup_preserves_data_and_binary_assets(self):
        with tempfile.TemporaryDirectory() as directory:
            base=Path(directory)
            source=base/'rack.sqlite3'
            with sqlite3.connect(source) as c:
                c.execute('CREATE TABLE model_assets(device_id TEXT, glb BLOB)')
                c.execute('INSERT INTO model_assets VALUES(?,?)',('device-test',b'glTF\x00\xff'))
            target=backup(source,base/'backup')
            self.assertTrue(target.is_file())
            with sqlite3.connect(target) as c:
                self.assertEqual(c.execute('PRAGMA integrity_check').fetchone()[0],'ok')
                self.assertEqual(c.execute('SELECT glb FROM model_assets').fetchone()[0],b'glTF\x00\xff')
            with sqlite3.connect(source) as c:
                c.execute('DELETE FROM model_assets')
            with sqlite3.connect(target) as c:
                self.assertEqual(c.execute('SELECT COUNT(*) FROM model_assets').fetchone()[0],1)

if __name__=='__main__':
    unittest.main()
