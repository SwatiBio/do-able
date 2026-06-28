from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services import bin_service

router = APIRouter(prefix="/api/bin", tags=["bin"])


@router.get("")
async def list_bin(
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await bin_service.list_binned_tasks(db, page=page, per_page=per_page)


@router.post("/{task_id}/restore")
async def restore_task(task_id: int, db: AsyncSession = Depends(get_db)):
    ok = await bin_service.restore_task(db, task_id)
    if not ok:
        raise HTTPException(404, "Task not found in bin")
    return {"ok": True}


@router.delete("/{task_id}", status_code=204)
async def hard_delete_task(task_id: int, db: AsyncSession = Depends(get_db)):
    ok = await bin_service.hard_delete_task(db, task_id)
    if not ok:
        raise HTTPException(404, "Task not found in bin")


@router.delete("", status_code=204)
async def empty_bin(db: AsyncSession = Depends(get_db)):
    await bin_service.empty_bin(db)
