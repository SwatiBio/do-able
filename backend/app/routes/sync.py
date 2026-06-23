from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete as sa_delete

from app.database import get_db
from app.models import ActivityLog, Config, ScratchNote, Tag, Task, TaskDep, TaskField, Note

router = APIRouter(prefix="/api/sync", tags=["sync"])


@router.post("/full")
async def full_sync(data: dict, db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc).isoformat()

    id_map = {}

    if "tasks" in data:
        await db.execute(sa_delete(Tag))
        await db.execute(sa_delete(TaskField))
        await db.execute(sa_delete(TaskDep))
        await db.execute(sa_delete(Note))
        await db.execute(sa_delete(Task))

        # First pass: create all tasks
        for t in data["tasks"]:
            local_id = str(t.get("id", ""))
            is_digit = local_id.isdigit()

            task = Task(
                id=int(local_id) if is_digit else None,
                title=t.get("title", ""),
                description=t.get("description", ""),
                status=t.get("status", "not_started"),
                priority=t.get("priority", "medium"),
                due_date=t.get("due_date"),
                start_date=t.get("start_date"),
                time=t.get("time"),
                category=t.get("category", ""),
                recur=t.get("recur"),
                created_at=t.get("created_at", now),
                updated_at=t.get("updated_at", now),
                deleted_at=t.get("deleted_at"),
                parent_id=t.get("parent_id"),
            )
            db.add(task)
            await db.flush()

            if not is_digit:
                id_map[local_id] = task.id

            for tag_name in t.get("tags", []):
                db.add(Tag(task_id=task.id, tag=tag_name))

            for n in t.get("notes", []):
                db.add(Note(
                    task_id=task.id,
                    text=n.get("text", ""),
                    timestamp=n.get("timestamp", now),
                ))

            # Preserve frontend-specific fields
            extras = {}
            if t.get("_sample"):
                extras["_sample"] = "true"
            if t.get("files"):
                import json
                extras["files"] = json.dumps(t["files"])

            for k, v in extras.items():
                db.add(TaskField(task_id=task.id, key=k, value=v))

            db.add(ActivityLog(
                task_id=task.id,
                action="created" if not is_digit else "synced",
                timestamp=now,
            ))

        # Second pass: process depends_on (all server IDs known now)
        for t in data["tasks"]:
            local_id = str(t.get("id", ""))
            is_digit = local_id.isdigit()
            server_id = int(local_id) if is_digit else id_map.get(local_id)
            if server_id is None:
                continue
            for dep_id in t.get("depends_on", []):
                dep_str = str(dep_id)
                mapped = id_map.get(dep_str)
                if mapped is None and dep_str.isdigit():
                    mapped = int(dep_id)
                if mapped:
                    db.add(TaskDep(task_id=server_id, depends_on=mapped))

    if "config" in data:
        await db.execute(sa_delete(Config))
        for k, v in data["config"].items():
            db.add(Config(key=k, value=str(v).lower() if isinstance(v, bool) else str(v)))

    if "notes" in data:
        await db.execute(sa_delete(ScratchNote))
        for n in data["notes"]:
            db.add(ScratchNote(
                text=n.get("text", ""),
                pinned=int(n.get("pinned", False)),
                created_at=n.get("created_at", now),
                updated_at=n.get("updated_at", now),
            ))

    await db.commit()
    return {"ok": True, "id_map": id_map}
