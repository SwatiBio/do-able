from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import TaskSeriesCreate, TaskSeriesUpdate
from app.services import task_series_service

router = APIRouter(prefix="/api/series", tags=["series"])


@router.get("")
async def list_series(db: AsyncSession = Depends(get_db)):
    return await task_series_service.list_series(db)


@router.post("", status_code=201)
async def create_series(data: TaskSeriesCreate, db: AsyncSession = Depends(get_db)):
    series = await task_series_service.create_series(db, data.model_dump())
    return task_series_service._series_to_dict(series)


@router.put("/{series_id}")
async def update_series(series_id: int, data: TaskSeriesUpdate, db: AsyncSession = Depends(get_db)):
    series = await task_series_service.update_series(db, series_id, data.model_dump(exclude_unset=True))
    if not series:
        raise HTTPException(404, "Series not found")
    return task_series_service._series_to_dict(series)


@router.post("/{series_id}/stop")
async def stop_series(series_id: int, db: AsyncSession = Depends(get_db)):
    series = await task_series_service.stop_series(db, series_id)
    if not series:
        raise HTTPException(404, "Series not found")
    return task_series_service._series_to_dict(series)


@router.delete("/{series_id}", status_code=204)
async def delete_series(series_id: int, db: AsyncSession = Depends(get_db)):
    ok = await task_series_service.delete_series(db, series_id)
    if not ok:
        raise HTTPException(404, "Series not found")
