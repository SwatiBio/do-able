from typing import Optional

from sqlalchemy import delete as sa_delete, select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import ActivityLog


async def get_activity_log(
    db: AsyncSession,
    task_id: Optional[int] = None,
    action: Optional[str] = None,
    page: int = 1,
    per_page: int = 25,
) -> dict:
    query = select(ActivityLog).order_by(ActivityLog.timestamp.desc())
    count_q = select(ActivityLog.id)

    if task_id is not None:
        query = query.where(ActivityLog.task_id == task_id)
        count_q = count_q.where(ActivityLog.task_id == task_id)
    if action:
        query = query.where(ActivityLog.action == action)
        count_q = count_q.where(ActivityLog.action == action)

    count_result = await db.execute(count_q)
    total = len(count_result.all())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    entries = []
    for entry in result.scalars().all():
        entries.append({
            "id": entry.id,
            "task_id": entry.task_id,
            "action": entry.action,
            "details": entry.details or "",
            "timestamp": entry.timestamp,
        })
    pages = max(1, (total + per_page - 1) // per_page)
    return {"entries": entries, "total": total, "page": page, "per_page": per_page, "pages": pages}


async def truncate_activity_log(db: AsyncSession, max_entries: int = 500):
    count_q = select(func.count(ActivityLog.id))
    result = await db.execute(count_q)
    total = result.scalar()
    if total > max_entries:
        to_delete = total - max_entries
        subq = select(ActivityLog.id).order_by(ActivityLog.timestamp.asc()).limit(to_delete).subquery()
        await db.execute(sa_delete(ActivityLog).where(ActivityLog.id.in_(select(subq.c.id))))
        await db.commit()
