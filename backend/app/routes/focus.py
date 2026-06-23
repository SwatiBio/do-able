from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import FocusUpdate
from app.services import focus_service

router = APIRouter(prefix="/api/focus", tags=["focus"])


@router.get("")
async def get_focus(db: AsyncSession = Depends(get_db)):
    task_ids = await focus_service.get_focus_goals(db)
    return {"task_ids": task_ids}


@router.put("")
async def set_focus(data: FocusUpdate, db: AsyncSession = Depends(get_db)):
    task_ids = await focus_service.set_focus_goals(db, data.task_ids)
    return {"task_ids": task_ids}
