import json
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Template


def _template_to_dict(t: Template) -> dict:
    return {
        "id": t.id,
        "name": t.name,
        "title": t.title,
        "description": t.description,
        "priority": t.priority,
        "category": t.category,
        "tags": json.loads(t.tags) if t.tags else [],
        "recur": t.recur,
        "created_at": t.created_at,
        "updated_at": t.updated_at,
    }


async def list_templates(db: AsyncSession) -> dict:
    result = await db.execute(select(Template).order_by(Template.name))
    templates = [_template_to_dict(t) for t in result.scalars().all()]
    return {"templates": templates}


async def create_template(db: AsyncSession, data: dict) -> Template:
    now = datetime.now(timezone.utc).isoformat()
    template = Template(
        name=data["name"],
        title=data.get("title", ""),
        description=data.get("description", ""),
        priority=data.get("priority", "medium"),
        category=data.get("category", ""),
        tags=json.dumps(data.get("tags", [])),
        recur=data.get("recur"),
        created_at=now,
        updated_at=now,
    )
    db.add(template)
    await db.commit()
    await db.refresh(template)
    return template


async def update_template(db: AsyncSession, template_id: int, data: dict) -> Optional[Template]:
    result = await db.execute(select(Template).where(Template.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        return None
    now = datetime.now(timezone.utc).isoformat()
    for field in ("name", "title", "description", "priority", "category", "recur"):
        if field in data and data[field] is not None:
            setattr(template, field, data[field])
    if "tags" in data and data["tags"] is not None:
        template.tags = json.dumps(data["tags"])
    template.updated_at = now
    await db.commit()
    await db.refresh(template)
    return template


async def delete_template(db: AsyncSession, template_id: int) -> bool:
    result = await db.execute(select(Template).where(Template.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        return False
    await db.delete(template)
    await db.commit()
    return True
