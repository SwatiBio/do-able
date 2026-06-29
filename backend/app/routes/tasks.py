from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import AnnotationCreate, TaskCreate, TaskUpdate
from app.services import task_service
from app.services.backup_service import auto_backup

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=dict)
async def list_tasks(
    status: str = Query(None),
    priority: str = Query(None),
    category: str = Query(None),
    tag: str = Query(None),
    due_today: bool = Query(False),
    overdue: bool = Query(False),
    search: str = Query(None),
    sort: str = Query(None),
    group: str = Query(None),
    flat: bool = Query(False),
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await task_service.list_tasks(
        db, status=status, priority=priority, category=category,
        tag=tag, due_today=due_today, overdue=overdue,
        search=search, sort=sort, group=group, flat=flat,
        page=page, per_page=per_page,
    )


@router.post("", status_code=201)
async def create_task(data: TaskCreate, db: AsyncSession = Depends(get_db)):
    task = await task_service.create_task(db, data.model_dump())
    await auto_backup()
    return task_service.task_to_dict(task)


@router.get("/{task_id}")
async def get_task(task_id: int, db: AsyncSession = Depends(get_db)):
    task = await task_service.get_task(db, task_id)
    if not task or task.deleted_at:
        raise HTTPException(404, "Task not found")
    return task_service.task_to_dict(task)


@router.put("/{task_id}")
async def update_task(task_id: int, data: TaskUpdate, db: AsyncSession = Depends(get_db)):
    task = await task_service.update_task(db, task_id, data.model_dump(exclude_none=True))
    if not task:
        raise HTTPException(404, "Task not found")
    await auto_backup()
    return task_service.task_to_dict(task)


@router.delete("/{task_id}", status_code=204)
async def delete_task(task_id: int, db: AsyncSession = Depends(get_db)):
    ok = await task_service.soft_delete_task(db, task_id)
    if not ok:
        raise HTTPException(404, "Task not found")
    await auto_backup()


@router.post("/{task_id}/done")
async def mark_done(task_id: int, db: AsyncSession = Depends(get_db)):
    task, recurrence = await task_service.mark_done(db, task_id)
    if not task:
        raise HTTPException(404, "Task not found")
    await auto_backup()
    resp = {"task": task_service.task_to_dict(task)}
    if recurrence:
        resp["recurrence"] = task_service.task_to_dict(recurrence)
    return resp


@router.post("/{task_id}/undone")
async def mark_undone(task_id: int, db: AsyncSession = Depends(get_db)):
    task = await task_service.mark_undone(db, task_id)
    if not task:
        raise HTTPException(404, "Task not found")
    return task_service.task_to_dict(task)


@router.post("/{task_id}/annotation", status_code=201)
async def add_annotation(task_id: int, data: AnnotationCreate, db: AsyncSession = Depends(get_db)):
    annotation = await task_service.add_annotation(db, task_id, data.text)
    if not annotation:
        raise HTTPException(404, "Task not found")
    return {"id": annotation.id, "text": annotation.text, "timestamp": annotation.timestamp}
