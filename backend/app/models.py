from datetime import datetime, timezone

from sqlalchemy import Column, Float, ForeignKey, Integer, String, Text, text
from sqlalchemy.orm import relationship

from app.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    status = Column(String, default="not_started")
    priority = Column(String, default="medium")
    due_date = Column(String, nullable=True)
    start_date = Column(String, nullable=True)
    time = Column(String, nullable=True)
    category = Column(String, default="")
    recur = Column(String, nullable=True)
    parent_id = Column(Integer, ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(String, nullable=False, default=lambda: datetime.now(timezone.utc).isoformat())
    updated_at = Column(String, nullable=False, default=lambda: datetime.now(timezone.utc).isoformat())
    deleted_at = Column(String, nullable=True)

    children = relationship("Task", backref="parent", remote_side=[id])
    tags = relationship("Tag", back_populates="task", cascade="all, delete-orphan")
    fields = relationship("TaskField", back_populates="task", cascade="all, delete-orphan")
    deps = relationship("TaskDep", back_populates="task", cascade="all, delete-orphan", foreign_keys="[TaskDep.task_id]")
    depended_by = relationship("TaskDep", back_populates="depends_on_task", foreign_keys="[TaskDep.depends_on]")
    notes = relationship("Note", back_populates="task", cascade="all, delete-orphan")


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    tag = Column(String, nullable=False)

    task = relationship("Task", back_populates="tags")


class TaskField(Base):
    __tablename__ = "task_fields"

    id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    key = Column(String, nullable=False)
    value = Column(String, nullable=False)

    task = relationship("Task", back_populates="fields")


class TaskDep(Base):
    __tablename__ = "task_deps"

    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), primary_key=True)
    depends_on = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), primary_key=True)

    task = relationship("Task", back_populates="deps", foreign_keys=[task_id])
    depends_on_task = relationship("Task", back_populates="depended_by", foreign_keys=[depends_on])


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    text = Column(String, nullable=False)
    timestamp = Column(String, nullable=False, default=lambda: datetime.now(timezone.utc).isoformat())

    task = relationship("Task", back_populates="notes")


class ActivityLog(Base):
    __tablename__ = "activity_log"

    id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True)
    action = Column(String, nullable=False)
    details = Column(String, default="")
    timestamp = Column(String, nullable=False, default=lambda: datetime.now(timezone.utc).isoformat())


class Config(Base):
    __tablename__ = "config"

    key = Column(String, primary_key=True)
    value = Column(String, nullable=False)


class ScratchNote(Base):
    __tablename__ = "scratch_notes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    text = Column(String, nullable=False)
    pinned = Column(Integer, default=0)
    created_at = Column(String, nullable=False, default=lambda: datetime.now(timezone.utc).isoformat())
    updated_at = Column(String, nullable=False, default=lambda: datetime.now(timezone.utc).isoformat())


BaseModel = Base
