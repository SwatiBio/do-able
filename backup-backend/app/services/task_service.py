import json
from datetime import datetime, timedelta, timezone
from typing import Optional

from dateutil import parser as dateparser
from sqlalchemy import select, delete as sa_delete, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import ActivityLog, Note, Tag, Task, TaskDep, TaskField


def parse_relative_date(text: str) -> Optional[str]:
    if not text:
        return None
    text = text.strip().lower()
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    if text == "today":
        return today.date().isoformat()
    if text == "tomorrow":
        return (today + timedelta(days=1)).date().isoformat()
    if text == "next mon":
        days_ahead = (7 - today.weekday() + 0) % 7 or 7
        return (today + timedelta(days=days_ahead)).date().isoformat()
    if text.startswith("+"):
        try:
            days = int(text.replace("d", "").replace("+", ""))
            return (today + timedelta(days=days)).date().isoformat()
        except ValueError:
            pass
    if text.startswith("next "):
        day_map = {"mon": 0, "tue": 1, "wed": 2, "thu": 3, "fri": 4, "sat": 5, "sun": 6}
        day_abbr = text[5:8]
        if day_abbr in day_map:
            target = day_map[day_abbr]
            days_ahead = (target - today.weekday() + 7) % 7 or 7
            return (today + timedelta(days=days_ahead)).date().isoformat()
    try:
        return dateparser.parse(text).date().isoformat()
    except (ValueError, OverflowError):
        return None


def make_due_date_for_recur(base_date: str, recur: str) -> str:
    dt = dateparser.parse(base_date).date()
    if recur == "daily":
        dt += timedelta(days=1)
    elif recur == "weekly":
        dt += timedelta(weeks=1)
    elif recur == "monthly":
        month = dt.month + 1
        year = dt.year
        if month > 12:
            month = 1
            year += 1
        try:
            dt = dt.replace(year=year, month=month)
        except ValueError:
            import calendar
            last_day = calendar.monthrange(year, month)[1]
            dt = dt.replace(year=year, month=month, day=last_day)
    return dt.isoformat()


def task_to_dict(task: Task) -> dict:
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description or "",
        "status": task.status,
        "priority": task.priority,
        "due_date": task.due_date,
        "category": task.category or "",
        "tags": [t.tag for t in task.tags],
        "fields": {f.key: f.value for f in task.fields},
        "recur": task.recur,
        "depends_on": [{"id": d.depends_on_task.id, "title": d.depends_on_task.title} for d in task.deps if d.depends_on_task],
        "notes": [{"id": n.id, "text": n.text, "timestamp": n.timestamp} for n in task.notes],
        "created_at": task.created_at,
        "updated_at": task.updated_at,
    }


async def create_task(db: AsyncSession, data: dict) -> Task:
    now = datetime.now(timezone.utc).isoformat()
    due = parse_relative_date(data.get("due_date")) if data.get("due_date") else None

    task = Task(
        title=data["title"],
        description=data.get("description", ""),
        priority=data.get("priority", "medium"),
        due_date=due,
        category=data.get("category", ""),
        recur=data.get("recur"),
        created_at=now,
        updated_at=now,
    )
    db.add(task)
    await db.flush()

    for tag_name in data.get("tags", []):
        db.add(Tag(task_id=task.id, tag=tag_name))

    for key, val in data.get("fields", {}).items():
        db.add(TaskField(task_id=task.id, key=key, value=val))

    for dep_id in data.get("depends_on", []):
        db.add(TaskDep(task_id=task.id, depends_on=dep_id))

    if data.get("note"):
        db.add(Note(task_id=task.id, text=data["note"], timestamp=now))

    db.add(ActivityLog(task_id=task.id, action="created", timestamp=now))
    await db.commit()
    task = await get_task(db, task.id)
    return task


_LOAD_OPTS = [
    selectinload(Task.tags),
    selectinload(Task.fields),
    selectinload(Task.deps).selectinload(TaskDep.depends_on_task),
    selectinload(Task.notes),
]


async def get_task(db: AsyncSession, task_id: int) -> Optional[Task]:
    result = await db.execute(
        select(Task).where(Task.id == task_id).options(*_LOAD_OPTS)
    )
    return result.unique().scalar_one_or_none()


async def update_task(db: AsyncSession, task_id: int, data: dict) -> Optional[Task]:
    task = await get_task(db, task_id)
    if not task:
        return None

    now = datetime.now(timezone.utc).isoformat()
    simple_fields = {"title", "description", "priority", "status", "category", "recur"}

    for key, val in data.items():
        if key in simple_fields and val is not None:
            setattr(task, key, val)
        elif key == "due_date" and val is not None:
            task.due_date = parse_relative_date(val) if isinstance(val, str) else val

    if "tags" in data and data["tags"] is not None:
        await db.execute(sa_delete(Tag).where(Tag.task_id == task_id))
        for tag_name in data["tags"]:
            db.add(Tag(task_id=task_id, tag=tag_name))

    if "fields" in data and data["fields"] is not None:
        await db.execute(sa_delete(TaskField).where(TaskField.task_id == task_id))
        for key, val in data["fields"].items():
            db.add(TaskField(task_id=task_id, key=key, value=val))

    if "depends_on" in data and data["depends_on"] is not None:
        await db.execute(sa_delete(TaskDep).where(TaskDep.task_id == task_id))
        for dep_id in data["depends_on"]:
            db.add(TaskDep(task_id=task_id, depends_on=dep_id))

    if data.get("note"):
        db.add(Note(task_id=task_id, text=data["note"], timestamp=now))

    task.updated_at = now
    db.add(ActivityLog(task_id=task_id, action="updated", timestamp=now))
    await db.commit()
    task = await get_task(db, task_id)
    return task


async def soft_delete_task(db: AsyncSession, task_id: int) -> bool:
    task = await get_task(db, task_id)
    if not task:
        return False
    task.deleted_at = datetime.now(timezone.utc).isoformat()
    task.updated_at = task.deleted_at
    db.add(ActivityLog(task_id=task_id, action="deleted", timestamp=task.deleted_at))
    await db.commit()
    return True


async def mark_done(db: AsyncSession, task_id: int) -> tuple[Task, Optional[Task]]:
    task = await get_task(db, task_id)
    if not task:
        return None, None

    now = datetime.now(timezone.utc).isoformat()
    task.status = "done"
    task.updated_at = now
    db.add(ActivityLog(task_id=task_id, action="completed", timestamp=now))

    recurrence = None
    if task.recur and task.due_date:
        new_date = make_due_date_for_recur(task.due_date, task.recur)
        new_task = Task(
            title=task.title,
            description=task.description,
            priority=task.priority,
            due_date=new_date,
            category=task.category,
            recur=task.recur,
            created_at=now,
            updated_at=now,
        )
        db.add(new_task)
        await db.flush()
        for t in task.tags:
            db.add(Tag(task_id=new_task.id, tag=t.tag))
        for f in task.fields:
            db.add(TaskField(task_id=new_task.id, key=f.key, value=f.value))
        recurrence = new_task

    await db.commit()
    task = await get_task(db, task_id)
    if recurrence:
        recurrence = await get_task(db, recurrence.id)
    return task, recurrence


async def mark_undone(db: AsyncSession, task_id: int) -> Optional[Task]:
    task = await get_task(db, task_id)
    if not task:
        return None
    task.status = "not_started"
    task.updated_at = datetime.now(timezone.utc).isoformat()
    await db.commit()
    task = await get_task(db, task_id)
    return task


async def add_note(db: AsyncSession, task_id: int, text: str) -> Optional[Note]:
    task = await get_task(db, task_id)
    if not task:
        return None
    now = datetime.now(timezone.utc).isoformat()
    note = Note(task_id=task_id, text=text, timestamp=now)
    db.add(note)
    task.updated_at = now
    await db.commit()
    await db.refresh(note)
    return note


async def list_tasks(
    db: AsyncSession,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    tag: Optional[str] = None,
    due_today: bool = False,
    overdue: bool = False,
    search: Optional[str] = None,
    sort: Optional[str] = None,
    group: Optional[str] = None,
    flat: bool = False,
    page: int = 1,
    per_page: int = 25,
) -> dict:
    query = select(Task).where(Task.deleted_at.is_(None)).options(*_LOAD_OPTS)

    if status:
        query = query.where(Task.status == status)
    if priority:
        query = query.where(Task.priority == priority)
    if category:
        query = query.where(Task.category == category)
    if tag:
        query = query.where(Task.tags.any(Tag.tag == tag))

    today_str = datetime.now(timezone.utc).date().isoformat()

    if due_today:
        query = query.where(Task.due_date == today_str)
    overdue_statuses = ["not_started", "started"]
    if overdue:
        query = query.where(Task.due_date.isnot(None), Task.due_date < today_str, Task.status.in_(overdue_statuses))

    if search:
        like = f"%{search}%"
        query = query.where(or_(Task.title.like(like), Task.description.like(like)))

    count_query = select(Task.id).where(Task.deleted_at.is_(None))
    # Apply same filters to count
    if status:
        count_query = count_query.where(Task.status == status)
    if priority:
        count_query = count_query.where(Task.priority == priority)
    if category:
        count_query = count_query.where(Task.category == category)
    if due_today:
        count_query = count_query.where(Task.due_date == today_str)
    if overdue:
        count_query = count_query.where(Task.due_date.isnot(None), Task.due_date < today_str, Task.status.in_(overdue_statuses))
    if search:
        count_query = count_query.where(or_(Task.title.like(like), Task.description.like(like)))
    if tag:
        count_query = count_query.where(Task.tags.any(Tag.tag == tag))

    count_result = await db.execute(count_query)
    total = len(count_result.all())

    if sort:
        parts = sort.split(",")
        for p in parts:
            p = p.strip()
            if not p:
                continue
            desc = p.startswith("-")
            field_name = p.lstrip("+-")
            col = getattr(Task, field_name, None)
            if col:
                query = query.order_by(col.desc() if desc else col)

    if group and not flat:
        pass

    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    tasks = list(result.scalars().unique().all())

    task_dicts = [task_to_dict(t) for t in tasks]
    pages = max(1, (total + per_page - 1) // per_page)

    if group and not flat:
        sections = []
        grouped = {"Overdue": [], "Today": [], "Upcoming": [], "No due date": []}
        for td in task_dicts:
            if td["status"] == "done":
                continue
            if td["due_date"] and td["due_date"] < today_str:
                grouped["Overdue"].append(td)
            elif td["due_date"] == today_str:
                grouped["Today"].append(td)
            elif td["due_date"]:
                grouped["Upcoming"].append(td)
            else:
                grouped["No due date"].append(td)
        for name, tsks in grouped.items():
            if tsks:
                sections.append({"name": name, "tasks": tsks})
        return {"sections": sections, "total": total, "page": page, "per_page": per_page, "pages": pages}

    return {"tasks": task_dicts, "total": total, "page": page, "per_page": per_page, "pages": pages}


async def search_tasks(db: AsyncSession, q: str, page: int = 1, per_page: int = 25) -> dict:
    like = f"%{q}%"
    query = (
        select(Task)
        .options(*_LOAD_OPTS)
        .where(Task.deleted_at.is_(None))
        .where(or_(Task.title.like(like), Task.description.like(like)))
    )
    count_q = (
        select(Task.id)
        .where(Task.deleted_at.is_(None))
        .where(or_(Task.title.like(like), Task.description.like(like)))
    )
    count_result = await db.execute(count_q)
    total = len(count_result.all())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    tasks = [task_to_dict(t) for t in result.scalars().unique().all()]
    pages = max(1, (total + per_page - 1) // per_page)
    return {"tasks": tasks, "total": total, "page": page, "per_page": per_page, "pages": pages}
