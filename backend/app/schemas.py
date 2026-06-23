from datetime import datetime, timezone
from typing import Any, Optional

from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    title: str
    description: str = ""
    priority: str = "medium"
    due_date: Optional[str] = None
    category: str = ""
    tags: list[str] = []
    fields: dict[str, str] = {}
    recur: Optional[str] = None
    depends_on: list[int] = []
    note: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[list[str]] = None
    fields: Optional[dict[str, str]] = None
    recur: Optional[str] = None
    depends_on: Optional[list[int]] = None
    note: Optional[str] = None


class NoteOut(BaseModel):
    id: int
    text: str
    timestamp: str


class DepOut(BaseModel):
    id: int
    title: str


class TaskOut(BaseModel):
    id: int
    title: str
    description: str
    status: str
    priority: str
    due_date: Optional[str] = None
    category: str
    tags: list[str] = []
    fields: dict[str, str] = {}
    recur: Optional[str] = None
    depends_on: list[DepOut] = []
    notes: list[NoteOut] = []
    created_at: str
    updated_at: str


class TaskListResponse(BaseModel):
    tasks: list[TaskOut] = []
    sections: Optional[list[dict[str, Any]]] = None
    total: int
    page: int
    per_page: int
    pages: int


class NoteCreate(BaseModel):
    text: str


class SearchParams(BaseModel):
    q: str
    page: int = 1
    per_page: int = 25


class DashboardResponse(BaseModel):
    counts: dict[str, int]
    overdue: int
    due_today: int
    by_priority: dict[str, int]
    by_category: dict[str, int]
    task_count_by_day: list[dict[str, Any]]
    weekly_recap: str
    monthly_recap: str
    recent_activity: list[dict[str, Any]]


class ActivityEntry(BaseModel):
    id: int
    task_id: Optional[int] = None
    action: str
    details: str
    timestamp: str


class ActivityResponse(BaseModel):
    entries: list[ActivityEntry]
    total: int
    page: int
    per_page: int
    pages: int


class ConfigResponse(BaseModel):
    theme: str = "auto"
    date_mode: str = "smart"
    notifications: bool = True
    per_page: int = 25


class ConfigUpdate(BaseModel):
    theme: Optional[str] = None
    date_mode: Optional[str] = None
    notifications: Optional[bool] = None
    per_page: Optional[int] = None


class BackupOut(BaseModel):
    filename: str
    size: int
    created_at: str


class BackupListResponse(BaseModel):
    backups: list[BackupOut]


class FocusResponse(BaseModel):
    task_ids: list[int]


class FocusUpdate(BaseModel):
    task_ids: list[int]


class ScratchNoteCreate(BaseModel):
    text: str
    pinned: bool = False


class ScratchNoteUpdate(BaseModel):
    text: Optional[str] = None
    pinned: Optional[bool] = None


class ScratchNoteOut(BaseModel):
    id: int
    text: str
    pinned: bool
    created_at: str
    updated_at: str


class PaginatedNotes(BaseModel):
    notes: list[ScratchNoteOut]
    total: int
    page: int
    per_page: int
    pages: int


class DoneResponse(BaseModel):
    task: TaskOut
    recurrence: Optional[TaskOut] = None
