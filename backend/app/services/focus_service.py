import json
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.config_service import get_config_value, set_config_value


async def get_focus_goals(db: AsyncSession) -> list[int]:
    raw = await get_config_value(db, "focus_goals")
    try:
        ids = json.loads(raw)
        if not isinstance(ids, list):
            return []
        return ids
    except (json.JSONDecodeError, TypeError):
        return []


async def set_focus_goals(db: AsyncSession, task_ids: list[int]) -> list[int]:
    await set_config_value(db, "focus_goals", json.dumps(task_ids))
    return task_ids


async def clear_expired_goals(db: AsyncSession):
    now = datetime.now(timezone.utc)
    today_str = now.date().isoformat()
    last_clear = await get_config_value(db, "focus_last_clear")
    if last_clear != today_str:
        await set_focus_goals(db, [])
        await set_config_value(db, "focus_last_clear", today_str)
