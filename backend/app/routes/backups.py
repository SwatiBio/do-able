from fastapi import APIRouter, Depends, HTTPException

from app.services import backup_service

router = APIRouter(prefix="/api/backups", tags=["backups"])


@router.get("")
async def list_backups():
    backups = await backup_service.list_backups()
    return {"backups": backups}


@router.post("", status_code=201)
async def create_backup():
    try:
        backup = await backup_service.create_backup()
        return backup
    except FileNotFoundError:
        raise HTTPException(500, "Database file not found")


@router.post("/{filename}/restore")
async def restore_backup(filename: str):
    ok = await backup_service.restore_backup(filename)
    if not ok:
        raise HTTPException(404, "Backup not found")
    return {"ok": True}
