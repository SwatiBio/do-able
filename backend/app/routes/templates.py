from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import TemplateCreate, TemplateUpdate
from app.services import template_service

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("")
async def list_templates(db: AsyncSession = Depends(get_db)):
    return await template_service.list_templates(db)


@router.post("", status_code=201)
async def create_template(data: TemplateCreate, db: AsyncSession = Depends(get_db)):
    template = await template_service.create_template(db, data.model_dump())
    return template_service._template_to_dict(template)


@router.put("/{template_id}")
async def update_template(template_id: int, data: TemplateUpdate, db: AsyncSession = Depends(get_db)):
    template = await template_service.update_template(db, template_id, data.model_dump(exclude_unset=True))
    if not template:
        raise HTTPException(404, "Template not found")
    return template_service._template_to_dict(template)


@router.delete("/{template_id}", status_code=204)
async def delete_template(template_id: int, db: AsyncSession = Depends(get_db)):
    ok = await template_service.delete_template(db, template_id)
    if not ok:
        raise HTTPException(404, "Template not found")
