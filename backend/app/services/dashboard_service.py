from datetime import datetime, timezone
from typing import Any

from sqlalchemy import func, select

from app.models import ActivityLog, Task
from sqlalchemy.ext.asyncio import AsyncSession


async def get_dashboard(db: AsyncSession) -> dict[str, Any]:
    today = datetime.now(timezone.utc).date()
    today_str = today.isoformat()

    tasks_q = await db.execute(select(Task).where(Task.deleted_at.is_(None)))
    all_tasks = tasks_q.scalars().all()

    total = len(all_tasks)
    not_started = sum(1 for t in all_tasks if t.status == "not_started")
    started = sum(1 for t in all_tasks if t.status == "started")
    done = sum(1 for t in all_tasks if t.status == "done")
    counts = {"total": total, "not_started": not_started, "started": started, "done": done}

    active_statuses = ["not_started", "started"]
    overdue = sum(
        1
        for t in all_tasks
        if t.status in active_statuses and t.due_date and t.due_date < today_str
    )
    due_today = sum(
        1 for t in all_tasks if t.due_date == today_str
    )

    by_priority = {"high": 0, "medium": 0, "low": 0}
    by_category: dict[str, int] = {}
    for t in all_tasks:
        if t.priority in by_priority:
            by_priority[t.priority] += 1
        if t.category:
            by_category[t.category] = by_category.get(t.category, 0) + 1

    task_count_by_day: list[dict[str, Any]] = []
    for i in range(29, -1, -1):
        from datetime import timedelta
        day = today - timedelta(days=i)
        count = sum(
            1
            for t in all_tasks
            if t.created_at.startswith(day.isoformat())
        )
        task_count_by_day.append({"date": day.isoformat(), "count": count})

    start_of_week = today - timedelta(days=today.weekday())
    week_tasks = [t for t in all_tasks if t.updated_at and any(
        t.updated_at.startswith((start_of_week + timedelta(days=i)).isoformat())
        for i in range(7)
    )]
    week_done = sum(1 for t in week_tasks if t.status == "done")
    week_created = sum(1 for t in all_tasks if t.created_at and any(
        t.created_at.startswith((start_of_week + timedelta(days=i)).isoformat())
        for i in range(7)
    ))
    week_overdue = sum(
        1
        for t in all_tasks
        if t.status in active_statuses and t.due_date and t.due_date < today_str
    )
    best_day = "N/A"
    weekly_recap = (
        f"This week: {week_done} completed, {week_created} created, "
        f"{week_overdue} still overdue. Best day: {best_day}."
    )

    start_of_month = today.replace(day=1)
    month_tasks = [t for t in all_tasks if t.updated_at and any(
        t.updated_at.startswith((start_of_month + timedelta(days=i)).isoformat())
        for i in range(31)
    )]
    month_done = sum(1 for t in month_tasks if t.status == "done")
    month_created = sum(1 for t in all_tasks if t.created_at and any(
        t.created_at.startswith((start_of_month + timedelta(days=i)).isoformat())
        for i in range(31)
    ))
    completion_rate = round((month_done / month_created * 100)) if month_created else 0
    monthly_recap = (
        f"This month: {month_done} completed, {month_created} created, "
        f"{completion_rate}% completion rate. Best day: N/A."
    )

    activity_q = (
        select(ActivityLog)
        .order_by(ActivityLog.timestamp.desc())
        .limit(5)
    )
    activity_result = await db.execute(activity_q)
    recent_activity = []
    for entry in activity_result.scalars().all():
        recent_activity.append({
            "action": entry.action,
            "task_id": entry.task_id,
            "timestamp": entry.timestamp,
            "details": entry.details or "",
        })

    return {
        "counts": counts,
        "overdue": overdue,
        "due_today": due_today,
        "by_priority": by_priority,
        "by_category": by_category,
        "task_count_by_day": task_count_by_day,
        "weekly_recap": weekly_recap,
        "monthly_recap": monthly_recap,
        "recent_activity": recent_activity,
    }
