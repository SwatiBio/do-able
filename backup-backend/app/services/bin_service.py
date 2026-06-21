from datetime import datetime, timezone

from sqlalchemy import delete as sa_delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import ActivityLog, Task
from app.services.task_service import task_to_dict


async def list_binned_tasks(db: AsyncSession, page: int = 1, per_page: int = 25) -> dict:
    query = select(Task).where(Task.deleted_at.isnot(None)).order_by(Task.deleted_at.desc())
    count_q = select(Task.id).where(Task.deleted_at.isnot(None))
    count_result = await db.execute(count_q)
    total = len(count_result.all())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    tasks = [task_to_dict(t) for t in result.scalars().all()]
    pages = max(1, (total + per_page - 1) // per_page)
    return {"tasks": tasks, "total": total, "page": page, "per_page": per_page, "pages": pages}


async def restore_task(db: AsyncSession, task_id: int) -> bool:
    result = await db.execute(select(Task).where(Task.id == task_id, Task.deleted_at.isnot(None)))
    task = result.scalar_one_or_none()
    if not task:
        return False
    now = datetime.now(timezone.utc).isoformat()
    task.deleted_at = None
    task.updated_at = now
    db.add(ActivityLog(task_id=task_id, action="restored", timestamp=now))
    await db.commit()
    return True


async def empty_bin(db: AsyncSession) -> bool:
    now = datetime.now(timezone.utc).isoformat()
    result = await db.execute(select(Task).where(Task.deleted_at.isnot(None)))
    for task in result.scalars().all():
        db.add(ActivityLog(task_id=task.id, action="deleted", details="permanent", timestamp=now))
    await db.execute(sa_delete(Task).where(Task.deleted_at.isnot(None)))
    await db.commit()
    return True
