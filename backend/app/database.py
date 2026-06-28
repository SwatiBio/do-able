import os
from pathlib import Path

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

DATA_DIR = Path.home() / ".todo"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / "todo.db"

engine = create_async_engine(f"sqlite+aiosqlite:///{DB_PATH}", echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
        tables = {row[0] for row in result}
        if "notes" in tables and "annotations" not in tables:
            await conn.execute(text("ALTER TABLE notes RENAME TO annotations"))
            tables.add("annotations")
            tables.discard("notes")
        if "scratch_notes" in tables and "notes" not in tables:
            await conn.execute(text("ALTER TABLE scratch_notes RENAME TO notes"))
        from app.models import BaseModel
        await conn.run_sync(BaseModel.metadata.create_all)

        if "tasks" in tables:
            cols = await conn.execute(text("PRAGMA table_info(tasks)"))
            col_names = {row[1] for row in cols}
            if "series_id" not in col_names:
                await conn.execute(text("ALTER TABLE tasks ADD COLUMN series_id INTEGER"))

    async with async_session() as session:
        from app.models import Task, TaskSeries, TaskField
        from sqlalchemy import select
        import json

        result = await session.execute(
            select(Task).where(Task.recur.isnot(None), Task.series_id.is_(None))
        )
        tasks = result.scalars().all()
        for task in tasks:
            files_result = await session.execute(
                select(TaskField).where(TaskField.task_id == task.id, TaskField.key == "files")
            )
            files_field = files_result.scalar_one_or_none()
            files_json = files_field.value if files_field else "[]"

            series = TaskSeries(
                title=task.title,
                description=task.description or "",
                priority=task.priority or "medium",
                category=task.category or "",
                tags="[]",
                recur=task.recur,
                start_date=task.start_date,
                time=task.time,
                files=files_json,
                active=1,
                created_at=task.created_at,
                updated_at=task.updated_at,
            )
            session.add(series)
            await session.flush()
            task.series_id = series.id

        if tasks:
            await session.commit()

    async with engine.begin() as conn:
        await conn.execute(text("UPDATE tasks SET status='in_progress' WHERE status='started'"))


async def close_db():
    await engine.dispose()
