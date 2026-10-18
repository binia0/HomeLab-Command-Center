"""Consistent SQLite backup (including saved GLB blobs and rack revisions).

Usage from inside API container:
    python /app/backup.py /data/backups
Backups should also be copied off-device. Does not delete any existing files.
"""
import datetime
import os
import sqlite3
import sys
from pathlib import Path

def backup(source, destination):
    source=Path(source)
    destination=Path(destination)
    if not source.is_file():
        raise FileNotFoundError(source)
    destination.mkdir(parents=True,exist_ok=True)
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    target=destination/f'hcc-{stamp}.sqlite3'
    if target.exists():
        raise FileExistsError(target)
    try:
        with sqlite3.connect(f'file:{source}?mode=ro',uri=True) as live:
            with sqlite3.connect(target) as copy:
                live.backup(copy)
                result=copy.execute('PRAGMA integrity_check').fetchone()[0]
                if result!='ok':
                    raise RuntimeError('Backup integrity check failed: '+result)
    except Exception:
        target.unlink(missing_ok=True)
        raise
    target.chmod(0o600)
    return target

if __name__=='__main__':
    folder=Path(sys.argv[1]) if len(sys.argv)>1 else Path('/data/backups')
    print(backup(os.getenv('HCC_DB','/data/hcc.sqlite3'),folder))
