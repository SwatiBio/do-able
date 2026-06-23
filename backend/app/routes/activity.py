from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.activity_service import get_activity_log

router = APIRouter(prefix="/api/activity", tags=["activity"])


@router.get("")
async def activity_log(
    task_id: Optional[int] = Query(None),
    action: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    return await get_activity_log(db, task_id=task_id, action=action, page=page, per_page=per_page)
