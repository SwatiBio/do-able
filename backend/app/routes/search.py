from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.task_service import search_tasks

router = APIRouter(prefix="/api", tags=["search"])


@router.get("/search")
async def search(
    q: str = Query(""),
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await search_tasks(db, q, page=page, per_page=per_page)
