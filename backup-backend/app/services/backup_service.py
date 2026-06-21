import os
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from app.database import DATA_DIR

BACKUP_DIR = DATA_DIR / "backups"
BACKUP_DIR.mkdir(parents=True, exist_ok=True)
MAX_BACKUPS = 50


async def create_backup() -> dict:
    db_path = DATA_DIR / "todo.db"
    if not db_path.exists():
        raise FileNotFoundError("Database file not found")
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H%M%S")
    filename = f"todo-{timestamp}.db"
    shutil.copy2(db_path, BACKUP_DIR / filename)
    _enforce_limit()
    size = (BACKUP_DIR / filename).stat().st_size
    return {"filename": filename, "size": size, "created_at": timestamp}


def _enforce_limit():
    backups = sorted(BACKUP_DIR.glob("todo-*.db"), key=os.path.getmtime)
    while len(backups) > MAX_BACKUPS:
        backups[0].unlink()
        backups.pop(0)


async def list_backups() -> list[dict]:
    backups = []
    for f in sorted(BACKUP_DIR.glob("todo-*.db"), key=os.path.getmtime, reverse=True):
        created = f.stem.replace("todo-", "").replace("T", "T")[:19]
        backups.append({
            "filename": f.name,
            "size": f.stat().st_size,
            "created_at": created,
        })
    return backups


async def restore_backup(filename: str) -> bool:
    backup_path = BACKUP_DIR / filename
    if not backup_path.exists():
        return False
    db_path = DATA_DIR / "todo.db"
    shutil.copy2(backup_path, db_path)
    return True


async def auto_backup():
    try:
        await create_backup()
    except FileNotFoundError:
        pass
