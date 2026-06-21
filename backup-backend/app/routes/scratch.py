from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import ScratchNoteCreate, ScratchNoteUpdate
from app.services import scratch_service

router = APIRouter(prefix="/api/notes", tags=["scratch"])


@router.get("")
async def list_notes(
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await scratch_service.list_notes(db, page=page, per_page=per_page)


@router.post("", status_code=201)
async def create_note(data: ScratchNoteCreate, db: AsyncSession = Depends(get_db)):
    note = await scratch_service.create_note(db, data.text, data.pinned)
    return {
        "id": note.id,
        "text": note.text,
        "pinned": bool(note.pinned),
        "created_at": note.created_at,
        "updated_at": note.updated_at,
    }


@router.put("/{note_id}")
async def update_note(note_id: int, data: ScratchNoteUpdate, db: AsyncSession = Depends(get_db)):
    note = await scratch_service.update_note(db, note_id, text=data.text, pinned=data.pinned)
    if not note:
        raise HTTPException(404, "Note not found")
    return {
        "id": note.id,
        "text": note.text,
        "pinned": bool(note.pinned),
        "created_at": note.created_at,
        "updated_at": note.updated_at,
    }


@router.delete("/{note_id}", status_code=204)
async def delete_note(note_id: int, db: AsyncSession = Depends(get_db)):
    ok = await scratch_service.delete_note(db, note_id)
    if not ok:
        raise HTTPException(404, "Note not found")
