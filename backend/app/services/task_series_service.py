import json
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import TaskSeries


def _series_to_dict(s: TaskSeries) -> dict:
    return {
        "id": s.id,
        "title": s.title,
        "description": s.description or "",
        "priority": s.priority,
        "category": s.category or "",
        "tags": json.loads(s.tags) if s.tags else [],
        "recur": s.recur,
        "start_date": s.start_date,
        "time": s.time,
        "files": json.loads(s.files) if s.files else [],
        "active": bool(s.active),
        "created_at": s.created_at,
        "updated_at": s.updated_at,
    }


async def list_series(db: AsyncSession) -> dict:
    result = await db.execute(select(TaskSeries).order_by(TaskSeries.id))
    series = [_series_to_dict(s) for s in result.scalars().all()]
    return {"series": series}


async def get_series(db: AsyncSession, series_id: int) -> Optional[TaskSeries]:
    result = await db.execute(select(TaskSeries).where(TaskSeries.id == series_id))
    return result.scalar_one_or_none()


async def create_series(db: AsyncSession, data: dict) -> TaskSeries:
    now = datetime.now(timezone.utc).isoformat()
    series = TaskSeries(
        title=data["title"],
        description=data.get("description", ""),
        priority=data.get("priority", "medium"),
        category=data.get("category", ""),
        tags=json.dumps(data.get("tags", [])),
        recur=data["recur"],
        start_date=data.get("start_date"),
        time=data.get("time"),
        files=json.dumps(data.get("files", [])),
        active=1 if data.get("active", True) else 0,
        created_at=now,
        updated_at=now,
    )
    db.add(series)
    await db.commit()
    await db.refresh(series)
    return series


async def update_series(db: AsyncSession, series_id: int, data: dict) -> Optional[TaskSeries]:
    series = await get_series(db, series_id)
    if not series:
        return None
    now = datetime.now(timezone.utc).isoformat()
    for field in ("title", "description", "priority", "category", "recur", "start_date", "time"):
        if field in data and data[field] is not None:
            setattr(series, field, data[field])
    if "tags" in data and data["tags"] is not None:
        series.tags = json.dumps(data["tags"])
    if "files" in data and data["files"] is not None:
        series.files = json.dumps(data["files"])
    if "active" in data and data["active"] is not None:
        series.active = 1 if data["active"] else 0
    series.updated_at = now
    await db.commit()
    await db.refresh(series)
    return series


async def stop_series(db: AsyncSession, series_id: int) -> Optional[TaskSeries]:
    return await update_series(db, series_id, {"active": False})


async def delete_series(db: AsyncSession, series_id: int) -> bool:
    series = await get_series(db, series_id)
    if not series:
        return False
    await db.delete(series)
    await db.commit()
    return True
