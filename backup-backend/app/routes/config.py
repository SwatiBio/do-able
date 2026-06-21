from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import ConfigUpdate
from app.services.config_service import get_all_config, update_config

router = APIRouter(prefix="/api/config", tags=["config"])


@router.get("")
async def get_config(db: AsyncSession = Depends(get_db)):
    return await get_all_config(db)


@router.put("")
async def set_config(data: ConfigUpdate, db: AsyncSession = Depends(get_db)):
    updates = data.model_dump(exclude_none=True)
    return await update_config(db, updates)
