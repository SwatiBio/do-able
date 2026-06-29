from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete as sa_delete

from app.database import get_db
from app.models import ActivityLog, Annotation, Config, Note, Tag, Task, TaskDep, TaskField, TaskSeries, Template

router = APIRouter(prefix="/api", tags=["admin"])


@router.delete("/all", status_code=204)
async def clear_all(db: AsyncSession = Depends(get_db)):
    await db.execute(sa_delete(ActivityLog))
    await db.execute(sa_delete(Tag))
    await db.execute(sa_delete(TaskField))
    await db.execute(sa_delete(TaskDep))
    await db.execute(sa_delete(Annotation))
    await db.execute(sa_delete(Task))
    await db.execute(sa_delete(Note))
    await db.execute(sa_delete(Config))
    await db.execute(sa_delete(Template))
    await db.execute(sa_delete(TaskSeries))
    await db.commit()
