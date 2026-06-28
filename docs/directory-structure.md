# Do-able - Directory Structure

```
do-able/
  doable.html              The entire frontend (2600+ lines, single file)
  start.bat                Starts uvicorn and opens the browser (Windows)
  stop.bat                 Kills the server process (Windows)
  sw.js                    Service worker for PWA offline caching
  site.webmanifest         PWA manifest with app name, icons, colors
  icon.svg                 App icon for PWA and notifications
  README.md                Getting started guide
  LICENSE                  MIT license
  .gitignore               Ignored files
  docs/
    api.md                 API reference (localStorage + REST)
    conceptual-model.md    Objects, states, relationships, architecture decisions
    design.md              Design specification
    directory-structure.md This file
    TRACKER.md             Build progress tracker
  backend/
    pyproject.toml         Project metadata
    requirements.txt       Python dependencies (fastapi, uvicorn, sqlalchemy, aiosqlite)
    app/
      __init__.py
      main.py              FastAPI entry point, route registration, CORS, root route
      database.py          SQLAlchemy async engine and session setup
      models.py            ORM models (Task, Tag, TaskField, TaskDep, Annotation, Config, Focus, Note, Template, TaskSeries, ActivityLog)
      schemas.py           Pydantic request/response schemas
      routes/
        __init__.py
        tasks.py           /api/tasks CRUD, done/undone, annotation
        config.py          /api/config GET/PUT
        focus.py           /api/focus GET/PUT
        scratch.py         /api/notes CRUD
        templates.py        /api/templates CRUD
        task_series.py      /api/series CRUD + stop
        sync.py            /api/sync/full bulk import with ID remapping
        dashboard.py       /api/dashboard analytics
        search.py          /api/search full-text search
        backups.py         /api/backups list/create/restore
        bin.py             /api/bin deleted tasks, restore, hard delete single, empty
        activity.py        /api/activity log
        export.py          /api/export/{fmt} json/csv/markdown
      services/
        __init__.py
        task_service.py    Task CRUD, done/undone, recurrence, dict conversion
        config_service.py  Config read/write
        focus_service.py   Focus goals read/write
        scratch_service.py Scratch notes CRUD
        template_service.py Template CRUD
        task_series_service.py Recurring series CRUD + stop
        sync_service.py    Bulk import with depends_on ID resolution
        dashboard_service.py Analytics queries
        search_service.py  Full-text search
        backup_service.py  Backup creation and restore
        bin_service.py     Deleted task management (list, restore, hard delete, empty)
        activity_service.py Activity log queries
        export_service.py  JSON/CSV/Markdown export
    tests/
      __init__.py
      conftest.py          Test fixtures and database setup
      test_tasks.py        Task endpoint tests
      test_templates.py    Template endpoint tests
      test_series.py       Series endpoint + sync mapping tests
```

## What each piece does

The frontend is a single HTML file. All CSS and JavaScript live inside it. No build step, no npm, no bundler. You can open it directly in a browser and it works offline using localStorage.

The backend is a FastAPI async server. It uses SQLAlchemy 2.0 with aiosqlite for async SQLite access. The database file is created automatically at `backend/.todo/todo.db` on first run.

The service worker (`sw.js`) caches the HTML, manifest, and icon for offline use. API routes are not cached so you always get fresh data when online.

The PWA manifest (`site.webmanifest`) tells browsers this is an installable app. It defines the app name, display mode (standalone, no browser chrome), theme colors, and icon.

## Data storage layers

| Layer | Where | Speed | Survives browser clear |
|-------|-------|-------|----------------------|
| localStorage | Browser | Instant | No |
| SQLite | backend/.todo/todo.db | Network round-trip | Yes |

The frontend reads from localStorage (zero latency) and writes to both localStorage and the backend. If the backend is offline, localStorage keeps working and the next successful sync catches up.
