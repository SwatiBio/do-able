import csv
import io
import json

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Task
from app.services.task_service import task_to_dict


async def export_json(db: AsyncSession) -> str:
    result = await db.execute(select(Task).where(Task.deleted_at.is_(None)))
    tasks = [task_to_dict(t) for t in result.scalars().all()]
    return json.dumps(tasks, indent=2)


async def export_csv(db: AsyncSession) -> str:
    result = await db.execute(select(Task).where(Task.deleted_at.is_(None)))
    tasks = result.scalars().all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "title", "description", "status", "priority", "due_date", "category", "recur", "created_at", "updated_at"])
    for t in tasks:
        writer.writerow([t.id, t.title, t.description, t.status, t.priority, t.due_date or "", t.category, t.recur or "", t.created_at, t.updated_at])
    return output.getvalue()


async def export_md(db: AsyncSession) -> str:
    result = await db.execute(select(Task).where(Task.deleted_at.is_(None)))
    tasks = result.scalars().all()
    lines = ["# Do-able — Task Export", "", "| ID | Title | Status | Priority | Due Date | Category |", "|---|---|---|---|---|---|"]
    for t in tasks:
        due = t.due_date or ""
        lines.append(f"| {t.id} | {t.title} | {t.status} | {t.priority} | {due} | {t.category} |")
    return "\n".join(lines)
