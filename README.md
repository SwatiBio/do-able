# Do-able

A local-first task manager with a FastAPI backend and a single-file HTML frontend.

## Architecture

```
doable.html  ←──→  FastAPI (Python)  ←──→  SQLite (aiosqlite)
  (UI)               (REST API)            (persistent DB)
```

- **Frontend**: Single HTML file (`doable.html`) — all CSS and JS embedded, zero build step
- **Backend**: FastAPI async server with SQLAlchemy 2.0 + SQLite
- **Storage**: SQLite database at `~/.todo/todo.db`
- **Sync**: Frontend uses localStorage for instant reads, background-syncs to the backend via REST API

## Getting Started

### Prerequisites

- **Python 3.10+** (3.12 recommended) — check with `python --version` or `py --version`
- **Git** — to clone the repo
- A modern browser (Chrome, Firefox, Edge, Safari)

### 1. Clone the repo

```bash
git clone https://github.com/SwatiBio/do-able.git
cd do-able
```

### 2. Set up a virtual environment (recommended)

```bash
cd backend

# Create venv
python -m venv .venv

# Activate it
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Windows (Git Bash):
source .venv/Scripts/activate
# macOS / Linux:
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

This installs: `fastapi`, `uvicorn[standard]`, `sqlalchemy[asyncio]`, `aiosqlite`, `pydantic`, and `httpx` (for tests).

### 4. Start the server

**Option A — Windows shortcut:**

Go back to the project root and double-click **`start.bat`**. It starts the server and opens your browser automatically.

**Option B — Manual:**

```bash
# From the backend/ directory (with venv active):
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or from the project root:

```bash
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Application startup complete.
```

### 5. Open the app

Navigate to **http://localhost:8000** in your browser. The app loads instantly — all UI is a single HTML file served by the backend.

### First run

On your first visit, the app loads **20 sample tasks** and **4 scratch notes** so you can explore immediately. The samples have `_sample` flags and can be removed via **Settings → Data → Remove Samples**.

A SQLite database is auto-created at `backend/.todo/todo.db` — no manual setup needed.

### Stopping the server

Double-click `stop.bat`, or press `Ctrl+C` in the terminal.

### Troubleshooting

| Problem | Fix |
|---------|-----|
| `python` / `pip` not found | Try `py --version` / `py -m pip install ...` (Windows launcher). Or install Python from [python.org](https://python.org) |
| `ModuleNotFoundError` | Make sure your venv is activated before running `pip install` and `uvicorn` |
| Port 8000 already in use | Use a different port: `uvicorn app.main:app --port 8001` |
| Database errors on startup | Delete the old database: `rm -f backend/.todo/todo.db` and restart |
| `start.bat` doesn't open browser | Open http://localhost:8000 manually — the server may still be starting |
| Blank page at localhost | Check the terminal for errors. Make sure you're in the `backend/` directory when starting uvicorn |

## Quick Start (no server)

You can open `doable.html` directly in a browser without the server. The app runs fully offline using localStorage. The backend is optional — it adds persistence beyond the browser and enables future multi-device sync.

**Note:** Without the server, data stays in your browser only. Clearing browser data will lose everything. Back up regularly via **Settings → Backups → Download Backup**.

## Things to Keep in Mind

- **Data lives in two places.** The frontend caches data in `localStorage` for instant access, and background-syncs to the SQLite database. If you clear your browser cache, the backend data remains and will re-sync on next load.
- **Works offline.** Once loaded, the frontend runs entirely in the browser. API calls happen in the background and queue if the server is unreachable.
- **No account needed.** No sign-up, no login, no tracking.
- **Single HTML file.** All CSS and JavaScript are embedded inside `doable.html`. You can edit it directly or open it standalone without the backend.
- **Backup regularly.** Use **Settings → Backups → Download Backup** to export all data as JSON.

## Features

**5 pages** in a collapsible orbital-ring sidebar (opens from left with backdrop overlay):

- **Dashboard** - scratch notes with pin/unpin, daily focus goals (max 3, status cycling by click, progress counter with confetti on all done), overdue and due-today task lists, priority and category bar charts, weekly/monthly completion recap table. "+ Add Task" button navigates to the Tasks page.
- **Tasks** - three view modes toggled via icon buttons:
  - **List** - sortable table with two-step popover sort (field → direction), data filters (status/priority/category/due range), column visibility toggle (tags/category/time/annotations/dependencies/recurrence) persisted to `doable_taskColumns`, pagination
  - **Kanban** - grouped by category with drag-and-drop to reassign, task count per column, drop zone
  - **Calendar** - month grid + week view with hourly time-blocking; multi-day bars, recurring task previews, drag-and-drop reschedule, jump-to-date picker, today indicator with pulse animation, overdue glow on past-due days
  - Quick-add input (title only, no priority dropdown) at the top
  - Rotating motivational quote displayed above tasks
  - Global search (debounced, across title + description, in topbar)
- **Task Detail** - full-page editor (not a modal) with inline editing for title, description, priority, status, due date, start date, time, category (hybrid select + type-new input), tags (with autocomplete datalist), recurrence (daily/weekly/monthly), dependencies (with incompletion warning and "blocks N tasks" indicator), annotations/notes timeline, created/updated timestamps. Unsaved changes warning on navigation away. Soft-delete to Bin.
- **Bin** - view soft-deleted tasks with deletion date and original status, restore individual tasks, empty bin completely with confirmation
- **Activity Log** - chronological feed of all mutations, filterable by action type (created/completed/deleted/restored/updated), paginated (25 per page), retains latest 500 entries
- **Settings** - collapsible accordion sections for:
  - **Appearance**: Nord Dark / Nord Light / System theme, frog companion toggle (SVG with 7 states)
  - **Display**: date mode (smart relative or ISO), tasks per page
  - **Backups**: download full backup as JSON, restore from JSON upload
  - **Export**: tasks as JSON, CSV, or Markdown
  - **Data**: clear all data (double confirmation), load or remove sample tasks
  - **Categories**: manage and delete unused categories (tasks become uncategorized)

**Extra touches:**
- Frog companion - an interactive SVG frog with 7 states (idle, sleep, stretch, walk, happy, peek, perch); random auto-cycling (12-30s), click-to-happy with hop animation, happy on confetti events, dashboard empty-state reading pose, modal peek, toast rider
- Confetti animation on task completion and when all daily focus goals are done
- Toast notifications for all actions (success/error/info)
- Recurring tasks auto-create next instance on completion (daily/weekly/monthly)
- Soft-delete (tasks go to Bin instead of permanent deletion)
- Unsaved changes warning when leaving the task detail page
- System theme detection via `prefers-color-scheme`
- Sample data on first run: 20 tasks with varied statuses/priorities/categories/tags/dependencies/recurrence/notes, 4 scratch notes (2 pinned)
- Eisenhower Matrix view for prioritization
- Heatmap grid on dashboard (GitHub-style contribution grid)
- Task roulette widget (random incomplete task picker)

**Task object fields:** `id`, `title`, `description`, `status` (not_started/started/done), `priority` (high/medium/low), `due_date`, `start_date`, `time`, `category`, `tags[]`, `recur` (daily/weekly/monthly/null), `depends_on[]`, `notes[]` (each with id/text/timestamp), `created_at`, `updated_at`, `deleted_at`, `_sample` (flag for sample data).

**Design:** Nord palette (dark and light), Tufte-inspired (no decorative illustrations, no shadows, no gradients — color only for semantic encoding, bar charts instead of sparklines, data labels instead of legends, space-only separation).

## Project Structure

```
todo-todo/
├── doable.html              # Frontend — entire app (single file)
├── backend/                 # FastAPI REST API server
│   ├── app/
│   │   ├── main.py          # App entry point, lifespan, CORS, root route
│   │   ├── database.py      # SQLAlchemy async engine + session
│   │   ├── models.py        # ORM models (Task, Tag, TaskDep, Note, etc.)
│   │   ├── schemas.py       # Pydantic v2 schemas
│   │   ├── routes/          # API route modules
│   │   │   ├── tasks.py     # CRUD for tasks
│   │   │   ├── sync.py      # Bulk sync endpoint (frontend → backend)
│   │   │   ├── config.py    # App config
│   │   │   ├── focus.py     # Focus goals
│   │   │   ├── scratch.py   # Scratch notes
│   │   │   ├── bin.py       # Soft-delete bin
│   │   │   ├── activity.py  # Activity log
│   │   │   ├── search.py    # Full-text search
│   │   │   ├── dashboard.py # Dashboard stats
│   │   │   ├── backups.py   # Backup/restore
│   │   │   └── export.py    # JSON/CSV/MD export
│   │   └── services/        # Business logic
│   ├── requirements.txt     # Python deps (fastapi, uvicorn, sqlalchemy, aiosqlite)
│   ├── tests/               # Backend tests
│   └── alembic/             # DB migrations (optional)
├── start.bat                # Double-click to start server + open browser
├── stop.bat                 # Double-click to stop server
├── README.md                # This file
├── design.md                # Design specification
├── api.md                   # API reference (localStorage + REST)
├── directory-structure.md   # Detailed file tree
├── TRACKER.md               # Build progress
├── LICENSE                  # MIT license
└── .gitignore
```

## License

[MIT](LICENSE) © SwatiBio
