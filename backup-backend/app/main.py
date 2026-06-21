import sys
from contextlib import asynccontextmanager
from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import DATA_DIR, close_db, init_db
from app.routes import (
    activity,
    backups,
    bin,
    config,
    dashboard,
    export,
    focus,
    scratch,
    search,
    tasks,
)
from app.services.config_service import get_all_config, set_config_value
from app.services.scratch_service import create_note


async def first_run_setup():
    config_path = DATA_DIR / "config"
    if not config_path.exists():
        config_path.write_text("# Do-able config\n")
        print("First run detected. Setting up defaults...")
        import asyncio
        from app.database import async_session
        async with async_session() as db:
            from app.services.config_service import set_config_value
            await set_config_value(db, "theme", "auto")
            await set_config_value(db, "date_mode", "smart")
            await set_config_value(db, "notifications", "true")
            await set_config_value(db, "per_page", "25")
            await set_config_value(db, "focus_goals", "[]")
            await create_note(db, "Welcome to Do-able! Edit or delete this note.")
            await db.commit()
        print("Defaults written.")
        print(f"Data directory: {DATA_DIR}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await first_run_setup()
    yield
    await close_db()


app = FastAPI(
    title="Do-able",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router)
app.include_router(search.router)
app.include_router(dashboard.router)
app.include_router(focus.router)
app.include_router(scratch.router)
app.include_router(bin.router)
app.include_router(activity.router)
app.include_router(config.router)
app.include_router(backups.router)
app.include_router(export.router)


frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
