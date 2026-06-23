# Do-able - Directory Structure

```
todo-todo/
├── doable.html                  # The entire frontend - HTML + CSS + JS (~1900 lines)
├── start.bat                    # Starts uvicorn + opens browser (Windows)
├── stop.bat                     # Kills the server process (Windows)
├── README.md                    # Getting started guide
├── design.md                    # Design specification
├── api.md                       # Data API reference (localStorage + REST)
├── directory-structure.md       # This file
├── TRACKER.md                   # Build tracker
├── LICENSE                      # MIT license
├── .gitignore                   # Ignored files
├── backend/                     # FastAPI backend
│   ├── pyproject.toml           # Project metadata
│   ├── requirements.txt         # Python dependencies (fastapi, sqlalchemy, aiosqlite, etc.)
│   └── app/
│       ├── __init__.py          # Empty package init
│       ├── main.py              # FastAPI app entry point, CORS, router registration, root route
│       ├── database.py          # SQLAlchemy async engine + session setup
│       ├── models.py            # ORM models (Task, Config, Focus, Note, Activity)
│       ├── schemas.py           # Pydantic request/response schemas
│       ├── routes/              # API route modules
│       │   ├── __init__.py
│       │   ├── tasks.py         # /api/tasks CRUD + done/undone/note
│       │   ├── config.py        # /api/config GET/PUT
│       │   ├── focus.py         # /api/focus GET/PUT
│       │   ├── notes.py         # /api/notes CRUD for scratch notes
│       │   ├── sync.py          # /api/sync/full bulk import with id_map
│       │   ├── dashboard.py     # /api/dashboard analytics
│       │   ├── search.py        # /api/search full-text search
│       │   ├── backups.py       # /api/backups list/create/restore
│       │   ├── bin.py           # /api/bin deleted tasks + restore
│       │   ├── activity.py      # /api/activity log
│       │   └── export.py        # /api/export/{fmt} json/csv/markdown
│       └── services/            # Business logic modules
│           ├── __init__.py
│           ├── task_service.py  # Task CRUD, done/undone, recurrence, dict flattening
│           ├── config_service.py
│           ├── focus_service.py
│           ├── note_service.py
│           ├── sync_service.py  # Bulk import with depends_on id_map resolution
│           ├── dashboard_service.py
│           ├── search_service.py
│           ├── backup_service.py
│           ├── bin_service.py
│           ├── activity_service.py
│           └── export_service.py
└── .todo/                       # SQLite database (auto-created, gitignored)
    └── todo.db
```

## Data Storage

| Layer | Storage | Purpose |
|-------|---------|---------|
| **Frontend cache** | `localStorage` (`doable_*` keys) | Instant synchronous reads for the UI |
| **Backend persistence** | SQLite via SQLAlchemy async (`backend/.todo/todo.db`) | Durable server-side storage |
| **Sync protocol** | `POST /api/sync/full` (debounced 800ms) | Bulk upload frontend state to backend on every mutation |

## Key Files

- **`doable.html`** — The entire frontend. HTML structure, Nord-theme CSS, and all JavaScript (app logic, API client, rendering, interactions). Single file, zero build step.
- **`backend/app/main.py`** — FastAPI entry point. Registers all routers under `/api/`, serves `doable.html` at `GET /`, configures CORS.
- **`backend/app/models.py`** — SQLAlchemy ORM models. Task model mirrors the frontend task object with all fields including `start_date`, `time`, `deleted_at`, `_sample`.
- **`backend/app/routes/sync.py`** — The critical sync endpoint. Accepts bulk task/note/config import, resolves `depends_on` ID remapping, returns `id_map` for frontend reconciliation.
- **`start.bat`** / **`stop.bat`** — Windows convenience scripts to start/stop the uvicorn server.
