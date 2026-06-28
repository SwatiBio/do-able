from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete as sa_delete

from app.database import get_db
from app.models import ActivityLog, Annotation, Config, Note, Tag, Task, TaskDep, TaskField, TaskSeries, Template
from app.schemas import FullSyncRequest

router = APIRouter(prefix="/api/sync", tags=["sync"])


@router.post("/full")
async def full_sync(data: FullSyncRequest, db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc).isoformat()

    id_map = {}
    series_id_map = {}

    series_list = data.series or []
    tasks_list = data.tasks or []
    config_data = data.config or {}
    notes_list = data.notes or []
    templates_list = data.templates or []

    if series_list:
        import json
        await db.execute(sa_delete(TaskSeries))
        for s in series_list:
            local_id = str(s.get("id", ""))
            is_digit = local_id.isdigit()
            series = TaskSeries(
                id=int(local_id) if is_digit else None,
                title=s.get("title", ""),
                description=s.get("description", ""),
                priority=s.get("priority", "medium"),
                category=s.get("category", ""),
                tags=json.dumps(s.get("tags", [])),
                recur=s.get("recur", "daily"),
                start_date=s.get("start_date"),
                time=s.get("time"),
                files=json.dumps(s.get("files", [])),
                active=1 if s.get("active", True) else 0,
                created_at=s.get("created_at", now),
                updated_at=s.get("updated_at", now),
            )
            db.add(series)
            await db.flush()
            if not is_digit:
                series_id_map[local_id] = series.id

    if tasks_list:
        await db.execute(sa_delete(Tag))
        await db.execute(sa_delete(TaskField))
        await db.execute(sa_delete(TaskDep))
        await db.execute(sa_delete(Annotation))
        await db.execute(sa_delete(Task))

        for t in tasks_list:
            local_id = str(t.get("id", ""))
            is_digit = local_id.isdigit()

            series_id_raw = t.get("series_id")
            series_id = None
            if series_id_raw is not None:
                sid_str = str(series_id_raw)
                if sid_str.isdigit():
                    series_id = int(sid_str)
                else:
                    series_id = series_id_map.get(sid_str)

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
                series_id=series_id,
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

            for n in t.get("annotations", []):
                db.add(Annotation(
                    task_id=task.id,
                    text=n.get("text", ""),
                    timestamp=n.get("timestamp", now),
                ))

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

        for t in tasks_list:
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

    if config_data:
        await db.execute(sa_delete(Config))
        for k, v in config_data.items():
            db.add(Config(key=k, value=str(v).lower() if isinstance(v, bool) else str(v)))

    if notes_list:
        await db.execute(sa_delete(Note))
        for n in notes_list:
            db.add(Note(
                text=n.get("text", ""),
                pinned=int(n.get("pinned", False)),
                created_at=n.get("created_at", now),
                updated_at=n.get("updated_at", now),
            ))

    if templates_list:
        import json
        await db.execute(sa_delete(Template))
        for tmpl in templates_list:
            db.add(Template(
                name=tmpl.get("name", ""),
                title=tmpl.get("title", ""),
                description=tmpl.get("description", ""),
                priority=tmpl.get("priority", "medium"),
                category=tmpl.get("category", ""),
                tags=json.dumps(tmpl.get("tags", [])),
                recur=tmpl.get("recur"),
                created_at=tmpl.get("created_at", now),
                updated_at=tmpl.get("updated_at", now),
            ))

    await db.commit()
    return {"ok": True, "id_map": id_map}
