from typing import Optional

from pydantic import BaseModel


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


class AnnotationCreate(BaseModel):
    text: str


class ConfigUpdate(BaseModel):
    theme: Optional[str] = None
    date_mode: Optional[str] = None
    notifications: Optional[bool] = None
    per_page: Optional[int] = None
    category_colors: Optional[str] = None


class FocusUpdate(BaseModel):
    task_ids: list[int]


class NoteCreate(BaseModel):
    text: str
    pinned: bool = False


class NoteUpdate(BaseModel):
    text: Optional[str] = None
    pinned: Optional[bool] = None


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
