from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import ScratchNote


async def list_notes(db: AsyncSession, page: int = 1, per_page: int = 25) -> dict:
    query = select(ScratchNote).order_by(ScratchNote.pinned.desc(), ScratchNote.updated_at.desc())
    count_q = select(ScratchNote.id)
    count_result = await db.execute(count_q)
    total = len(count_result.all())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    notes = []
    for n in result.scalars().all():
        notes.append({
            "id": n.id,
            "text": n.text,
            "pinned": bool(n.pinned),
            "created_at": n.created_at,
            "updated_at": n.updated_at,
        })
    pages = max(1, (total + per_page - 1) // per_page)
    return {"notes": notes, "total": total, "page": page, "per_page": per_page, "pages": pages}


async def create_note(db: AsyncSession, text: str, pinned: bool = False) -> ScratchNote:
    now = datetime.now(timezone.utc).isoformat()
    note = ScratchNote(text=text, pinned=int(pinned), created_at=now, updated_at=now)
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note


async def update_note(db: AsyncSession, note_id: int, text: Optional[str] = None, pinned: Optional[bool] = None) -> Optional[ScratchNote]:
    result = await db.execute(select(ScratchNote).where(ScratchNote.id == note_id))
    note = result.scalar_one_or_none()
    if not note:
        return None
    now = datetime.now(timezone.utc).isoformat()
    if text is not None:
        note.text = text
    if pinned is not None:
        note.pinned = int(pinned)
    note.updated_at = now
    await db.commit()
    await db.refresh(note)
    return note


async def delete_note(db: AsyncSession, note_id: int) -> bool:
    result = await db.execute(select(ScratchNote).where(ScratchNote.id == note_id))
    note = result.scalar_one_or_none()
    if not note:
        return False
    await db.delete(note)
    await db.commit()
    return True
