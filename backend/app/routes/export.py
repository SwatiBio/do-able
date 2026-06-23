from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services import export_service

router = APIRouter(prefix="/api/export", tags=["export"])


@router.get("/{fmt}")
async def export(fmt: str, db: AsyncSession = Depends(get_db)):
    if fmt == "json":
        content = await export_service.export_json(db)
        return Response(content=content, media_type="application/json", headers={"Content-Disposition": "attachment; filename=tasks.json"})
    elif fmt == "csv":
        content = await export_service.export_csv(db)
        return Response(content=content, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=tasks.csv"})
    elif fmt == "md":
        content = await export_service.export_md(db)
        return Response(content=content, media_type="text/markdown", headers={"Content-Disposition": "attachment; filename=tasks.md"})
    raise HTTPException(400, f"Unsupported format: {fmt}")
