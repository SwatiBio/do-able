from datetime import datetime, timezone
from typing import Any, Optional

from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    title: str
    description: str = ""
    status: str = "not_started"
    priority: str = "medium"
    due_date: Optional[str] = None
    start_date: Optional[str] = None
    time: Optional[str] = None
    category: str = ""
    tags: list[str] = []
    fields: dict[str, str] = {}
    recur: Optional[str] = None
    series_id: Optional[int] = None
    depends_on: list[int] = []
    depends_on_str: list[str] = []
    annotations: list[dict] = []
    files: list[dict] = []
    annotation: Optional[str] = None
    parent_id: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[str] = None
    start_date: Optional[str] = None
    time: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[list[str]] = None
    fields: Optional[dict[str, str]] = None
    recur: Optional[str] = None
    series_id: Optional[int] = None
    depends_on: Optional[list[int]] = None
    annotation: Optional[str] = None
    parent_id: Optional[int] = None


class AnnotationOut(BaseModel):
    id: int
    text: str
    timestamp: str


class DepOut(BaseModel):
    id: int
    title: str


class TaskOut(BaseModel):
    model_config = {"populate_by_name": True}

    id: int
    title: str
    description: str
    status: str
    priority: str
    due_date: Optional[str] = None
    start_date: Optional[str] = None
    time: Optional[str] = None
    category: str
    tags: list[str] = []
    fields: dict[str, str] = {}
    recur: Optional[str] = None
    depends_on: list[DepOut] = []
    annotations: list[AnnotationOut] = []
    parent_id: Optional[int] = None
    series_id: Optional[int] = None
    files: list[dict] = []
    sample: bool = Field(False, alias="_sample")
    created_at: str
    updated_at: str
    deleted_at: Optional[str] = None


class TaskListResponse(BaseModel):
    tasks: list[TaskOut] = []
    sections: Optional[list[dict[str, Any]]] = None
    total: int
    page: int
    per_page: int
    pages: int


class AnnotationCreate(BaseModel):
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
    category_colors: str = "{}"


class ConfigUpdate(BaseModel):
    theme: Optional[str] = None
    date_mode: Optional[str] = None
    notifications: Optional[bool] = None
    per_page: Optional[int] = None
    category_colors: Optional[str] = None


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


class NoteCreate(BaseModel):
    text: str
    pinned: bool = False


class NoteUpdate(BaseModel):
    text: Optional[str] = None
    pinned: Optional[bool] = None


class NoteOut(BaseModel):
    id: int
    text: str
    pinned: bool
    created_at: str
    updated_at: str


class PaginatedNotes(BaseModel):
    notes: list[NoteOut]
    total: int
    page: int
    per_page: int
    pages: int


class DoneResponse(BaseModel):
    task: TaskOut
    recurrence: Optional[TaskOut] = None


class TemplateCreate(BaseModel):
    name: str
    title: str
    description: str = ""
    priority: str = "medium"
    category: str = ""
    tags: list[str] = []
    recur: Optional[str] = None


class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[list[str]] = None
    recur: Optional[str] = None


class TemplateOut(BaseModel):
    id: int
    name: str
    title: str
    description: str
    priority: str
    category: str
    tags: list[str] = []
    recur: Optional[str] = None
    created_at: str
    updated_at: str


class TaskSeriesCreate(BaseModel):
    title: str
    description: str = ""
    priority: str = "medium"
    category: str = ""
    tags: list[str] = []
    recur: str
    start_date: Optional[str] = None
    time: Optional[str] = None
    files: list[dict] = []
    active: bool = True


class TaskSeriesUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[list[str]] = None
    recur: Optional[str] = None
    start_date: Optional[str] = None
    time: Optional[str] = None
    files: Optional[list[dict]] = None
    active: Optional[bool] = None


class TaskSeriesOut(BaseModel):
    id: int
    title: str
    description: str
    priority: str
    category: str
    tags: list[str] = []
    recur: str
    start_date: Optional[str] = None
    time: Optional[str] = None
    files: list[dict] = []
    active: bool
    created_at: str
    updated_at: str


class FullSyncRequest(BaseModel):
    tasks: list[dict] = []
    notes: list[dict] = []
    config: dict = {}
    templates: list[dict] = []
    series: list[dict] = []
