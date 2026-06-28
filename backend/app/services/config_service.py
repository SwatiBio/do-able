from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Config


DEFAULT_CONFIG = {
    "theme": "auto",
    "date_mode": "smart",
    "notifications": "true",
    "per_page": "25",
    "focus_goals": "[]",
}


async def get_all_config(db: AsyncSession) -> dict:
    result = await db.execute(select(Config))
    rows = result.scalars().all()
    config = dict(DEFAULT_CONFIG)
    for row in rows:
        config[row.key] = row.value
    return {
        "theme": config["theme"],
        "date_mode": config["date_mode"],
        "notifications": config["notifications"] == "true",
        "per_page": int(config["per_page"]),
        "category_colors": config.get("category_colors", "{}"),
    }


async def update_config(db: AsyncSession, updates: dict) -> dict:
    for key, val in updates.items():
        str_val = str(val).lower() if isinstance(val, bool) else str(val)
        existing = await db.execute(select(Config).where(Config.key == key))
        row = existing.scalar_one_or_none()
        if row:
            row.value = str_val
        else:
            db.add(Config(key=key, value=str_val))
    await db.commit()
    return await get_all_config(db)


async def get_config_value(db: AsyncSession, key: str) -> str:
    result = await db.execute(select(Config).where(Config.key == key))
    row = result.scalar_one_or_none()
    if row:
        return row.value
    return DEFAULT_CONFIG.get(key, "")


async def set_config_value(db: AsyncSession, key: str, value: str):
    existing = await db.execute(select(Config).where(Config.key == key))
    row = existing.scalar_one_or_none()
    if row:
        row.value = value
    else:
        db.add(Config(key=key, value=value))
    await db.commit()
