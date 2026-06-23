# Do-able - Design

## Overview

A task manager with a FastAPI backend and a single-file HTML frontend. The backend persists data in SQLite; the frontend caches everything in `localStorage` for instant reads and syncs writes to the server in the background.

## Architecture

```
┌─────────────────────────────────────┐
│          doable.html                │
│  ┌───────────────────────────────┐  │
│  │  HTML (semantic structure)    │  │
│  ├───────────────────────────────┤  │
│  │  CSS (Nord theme, layout)     │  │
│  ├───────────────────────────────┤  │
│  │  JavaScript (app logic)       │  │
│  │  + API client (background     │  │
│  │    sync to FastAPI backend)   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
       ↕ localStorage (cache)        ↕ HTTP (background sync)
┌─────────────────────┐    ┌──────────────────────────┐
│  Browser localStorage│    │   FastAPI Backend         │
│  doable_tasks        │    │   /api/tasks              │
│  doable_activity     │    │   /api/config             │
│  doable_config       │    │   /api/notes              │
│  doable_notes        │    │   /api/focus              │
│  doable_focus        │    │   /api/sync/full          │
│  doable_taskColumns  │    │   + 20 more endpoints     │
└─────────────────────┘    └──────────────────────────┘
                                    ↕
                           ┌──────────────────┐
                           │   SQLite Database │
                           │   backend/.todo/  │
                           │   todo.db          │
                           └──────────────────┘
```

- Frontend reads from `localStorage` (instant, synchronous)
- Every write updates `localStorage` immediately AND fires a background API call to persist to the server
- On startup, `_initApi()` loads fresh data from the API and merges into `localStorage`
- `_syncFull()` debounces bulk sync (800ms) posting all tasks/notes/config to `/api/sync/full`
- If the server is offline, `localStorage` still works — data syncs when connectivity returns

## Layout

```
┌────────────┬──────────────────────────────────┐
│            │  Topbar (search + theme toggle)   │
│  Orbital   ├──────────────────────────────────┤
│  Ring      │  Main Content Area               │
│  Sidebar   │  (max-width: 1100px, centered)    │
│  (fixed    │                                   │
│   overlay) │  One page visible at a time       │
│            │                                   │
└────────────┴──────────────────────────────────┘
```

- **Orbital ring** - 44px circular button fixed at bottom-left; opens a 200px sidebar overlay with backdrop
- **Topbar** - 52px header with global search (debounced) and theme-cycle icon button
- **Main content** - scrollable area, max-width 1100px, centered

## Views

### 1. Dashboard
- Bento grid layout (2fr + 1fr top row, full-width analytics section below)
- Scratch pad notes (create, pin/unpin, delete; sorted pinned-first, then by updated_at)
- Focus goals selector (dropdown picks from all active tasks, max 3 per day; click goal to cycle status: not_started → started → done → not_started; progress counter; confetti when all done)
- "+ Add Task" button (navigates to Tasks page)
- Overdue tasks list (due before today, not done, max 5)
- Due today list (max 5)
- Bar charts (by priority - high/medium/low - using semantic colors; by category - up to 8, using accent color)
- **Heatmap grid** — GitHub-style contribution heatmap (53 weeks × 7 days) showing task completion density. Replaces the old recap table. Month labels along the top, today highlighted with an outline, Nord color scale from muted to accent.
- **Task roulette** — "Pick random" button that selects a random incomplete task and displays it with a clickable link.
- Frog reading a tiny book in the analytics area when no tasks exist (empty state).

### 2. Tasks
Four view modes toggled via icon buttons:

**List View** - sortable table with:
- Two-step popover sort (select field → select direction). Active sorts shown as removable chips in sort bar.
- Data filters for status, priority, category, due range (all/today/overdue/week/month/none)
- Column visibility toggle (tags, category, time, annotations, dependencies, recurrence) - persisted to `doable_taskColumns`
- Pagination (configurable per-page via Settings)
- Row shows checkbox, priority dot, title, priority text, status badge, due date, plus any visible extra columns

**Kanban View** - grouped by category with:
- Drag-and-drop to reassign category
- Task count per column header
- Drop zone at bottom of each column
- Responsive auto-fill columns (min 280px)

**Calendar View** - two sub-modes:
- **Month grid** - 7-column grid, day numbers, priority dot indicators (overflow shows expandable popover), today pulse animation, overdue glow (red inset shadow), multi-day bars for tasks spanning multiple dates, recurring task previews (shown in calendar but not yet created), click to expand inline task list, drag-and-drop to reschedule due date
- **Week view** - 7-day columns with hourly time slots (07:00–22:00), today column highlight, time-labelled tasks, tasks without time shown at 12:00 slot, drag-and-drop reschedule
- Calendar controls: ← → navigation, Today button, Month/Week toggle, jump-to-date date picker

**Eisenhower Matrix** - 2×2 grid (Do First / Schedule / Delegate / Eliminate):
- Quadrant assignment based on urgency (due_date proximity) × importance (priority level)
- Do First: high importance + urgent (high/medium priority + due within 3 days or overdue)
- Schedule: high importance + not urgent (high/medium priority + due later or no due)
- Delegate: low importance + urgent (low priority + due within 3 days or overdue)
- Eliminate: low importance + not urgent (low priority + no due or due later)
- Each quadrant shows task count, list of tasks with priority dots and due dates, click task title to open detail
- Hint text above the matrix explaining the quadrant logic

Features:
- Quick-add input (title only, no priority - defaults to medium, not_started, no due date) at top of page
- Rotating motivational quote (random from 28 built-in quotes, no repeat in a row)
- Global search (debounced 300ms, across title + description)
- Filter state persists during session

### 3. Task Detail
Opens as a full page (not a modal) when clicking any task title:
- Inline editing: title (large serif font), description (textarea), priority, status, due date, start date, time
- Category: hybrid select dropdown + type-new input (press Enter to add new category to dropdown)
- Tags: pill display with remove, input with autocomplete datalist from all existing tags
- Recurrence setting (none / daily / weekly / monthly)
- Dependency links: searchable by title, shows status badge + priority dot, incompletion warning banner, "blocks N other tasks" indicator
- Annotations timeline with relative timestamps
- Created/updated timestamps
- Delete button (soft-delete to Bin)
- Save button
- Unsaved changes warning via `confirm()` dialog on navigation away

### 4. Bin
- Table of soft-deleted tasks (title link opens detail, deletion date, original status)
- Restore individual tasks
- Empty bin with single confirmation
- Empty state when no deleted tasks

### 5. Activity Log
- Chronological feed of all mutations (newest first)
- Filter by action type dropdown (all/created/completed/deleted/restored/updated)
- Each entry: colored dot by action type, action label + details, relative timestamp
- Paginated (25 per page)
- Keeps latest 500 entries, truncated to last 10 days

### 6. Settings
Collapsible accordion sections (each toggles open/closed via h2 click):

- **Appearance**: Theme select (Nord Dark / Nord Light / System), Frog companion checkbox with description of all 7 behaviors
- **Display**: Date mode select (Smart relative / ISO), Tasks per page number input
- **Backups**: Download Backup button (JSON), Restore from backup file input
- **Export**: JSON / CSV / Markdown buttons
- **Data**: Clear All Data (double confirmation), Load Samples / Remove Samples buttons
- **Categories**: List of all categories with task count + Delete button (confirms, sets tasks to uncategorized)

## Backend

FastAPI async server with SQLAlchemy 2.0 + SQLite (via `aiosqlite`).

### Starting the server

```bash
cd backend
py -m pip install -r requirements.txt
py -B -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or from the project root: double-click `start.bat` (Windows) which starts the server and opens the browser.

### Key endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Serves `doable.html` |
| `GET/POST` | `/api/tasks` | List or create tasks |
| `GET/PUT/DELETE` | `/api/tasks/{id}` | Read, update, or delete a task |
| `POST` | `/api/tasks/{id}/done` | Mark task done (triggers recurrence) |
| `POST` | `/api/tasks/{id}/undone` | Reopen a done task |
| `POST` | `/api/tasks/{id}/note` | Add annotation to task |
| `GET/PUT` | `/api/config` | Read or update config |
| `GET/PUT` | `/api/focus` | Read or update focus goals |
| `GET/POST/PUT/DELETE` | `/api/notes` | CRUD for scratch notes |
| `POST` | `/api/sync/full` | Bulk import tasks/notes/config (returns `id_map` for frontend ID reconciliation) |
| `GET` | `/api/dashboard` | Dashboard analytics |
| `GET` | `/api/search?q=` | Full-text search across tasks |
| `GET/POST` | `/api/backups` | List or create backups |
| `POST` | `/api/backups/{file}/restore` | Restore from backup |
| `GET` | `/api/bin` | List deleted tasks |
| `POST` | `/api/bin/{id}/restore` | Restore a deleted task |
| `DELETE` | `/api/bin` | Empty bin |
| `GET` | `/api/activity` | Activity log |
| `GET` | `/api/export/{fmt}` | Export tasks (json/csv/markdown) |

### Data model

SQLAlchemy models in `backend/app/models.py`:
- `Task` — mirrors the frontend task object (id, title, description, status, priority, due_date, start_date, time, category, tags, recur, depends_on, notes, created_at, updated_at, deleted_at, _sample)
- `Config` — JSON-serialized config blob
- `Focus` — JSON-serialized focus goals map
- `Note` — scratch pad notes
- `Activity` — activity log entries

## Theme: Nord

CSS custom properties switching via `data-theme` attribute on `<html>`.

Three modes:
- `nord-dark` (default) - dark slate background (#2e3440)
- `nord-light` - light grey background (#eceff4)
- `system` - follows `prefers-color-scheme` media query, re-evaluated on change

Color tokens:
- `--accent` (#88c0d0 dark, #5e81ac light) - primary interactive elements, links
- `--red` (#bf616a) - high priority, overdue, danger, delete
- `--orange` (#d08770) - medium priority, due today, started status
- `--yellow` (#ebcb8b) - low priority (status dot only)
- `--green` (#a3be8c) - low priority, done status, success
- `--purple` (#b48ead) - confetti accent
- `--text` / `--text-dim` / `--text-faint` - three-tier text hierarchy
- `--bg` / `--bg-raised` / `--bg-hover` / `--bg-muted` - surface hierarchy

## Frog Companion

An interactive SVG frog that lives on the screen. Toggled in Settings (persisted in `config.frog_enabled`).

States (7 total):
- **Idle** - sits and breathes gently (gentle scaleY animation, most common state)
- **Sleep** - dozes off with animated "💤" Zzz bubbles floating upward (long duration ~10s)
- **Stretch** - lazy stretch animation (~1.8s) once in a while
- **Walk** - walks across the screen (waddle animation), alternating left-right per trigger
- **Happy** - bounces excitedly (4 cycles, ~2s) on confetti events or when clicked
- **Peek** - peeks up from below (~2s, translateY keyframes)
- **Perch** - hops to a random new position (~0.7s, scale+rotate hop animation)

Behaviors:
- Random idle/sleep/stretch cycle (12–30s interval; sleep ~35%, idle ~35%, stretch ~10%)
- Click the frog → happy animation, then hops to a new position with a CSS transition (no teleport)
- Frog gets happy automatically when confetti fires (task completion)
- Frog peeks behind modal overlay when a modal is open
- Frog rides inside toast notifications
- Responsive: repositions to stay within viewport on window resize
- SVG is ~60×52px, green frog with eyes, smile, legs, cheek blush

## Tufte Principles

| # | Principle | Implementation |
|---|-----------|----------------|
| 1 | Show the data | No splash screens, no onboarding modals |
| 2 | Maximize data-ink ratio | No decorative illustrations, no shadows, no gradients |
| 3 | Erase non-data-ink | No box borders on cards, space-only separation |
| 4 | Erase redundant data-ink | Priority encoded via color dot only (text label also present in list view) |
| 5 | Graphical integrity | Bar chart bars start at zero, no truncated axes |
| 6 | Small multiples | CSS bar charts running vertically |
| 7 | Layering & separation | Sidebar dimmer than content, three-tier text hierarchy |
| 8 | Micro/macro readings | Task list scannable at a glance, detail page has full info |
| 9 | Smallest effective difference | Priority dots, status badges with distinct colors |
| 10 | Word-data integration | Labels on data, no separate legends |

## Data Model

Each task:
```json
{
  "id": "string (unique)",
  "title": "string",
  "description": "string",
  "status": "not_started | started | done",
  "priority": "low | medium | high",
  "due_date": "YYYY-MM-DD | null",
  "start_date": "YYYY-MM-DD | null",
  "time": "HH:mm | null",
  "category": "string",
  "tags": ["string"],
  "recur": "daily | weekly | monthly | null",
  "depends_on": ["task_id"],
  "notes": [{"id", "text", "timestamp"}],
  "created_at": "ISO datetime",
  "updated_at": "ISO datetime",
  "deleted_at": "ISO datetime | null",
  "_sample": true | undefined
}
```

## Files

```
todo-todo/
├── doable.html              # The entire frontend (~1900 lines)
├── start.bat                # Starts uvicorn + opens browser (Windows)
├── stop.bat                 # Kills the server process (Windows)
├── README.md                # Getting started guide
├── design.md                # This file
├── api.md                   # Data API reference (localStorage + REST)
├── directory-structure.md   # File tree
├── TRACKER.md               # Build progress
├── LICENSE                  # MIT license
├── .gitignore               # Ignored files
└── backend/                 # FastAPI backend
    ├── pyproject.toml
    ├── requirements.txt
    └── app/
        ├── __init__.py
        ├── main.py           # FastAPI app entry point
        ├── database.py       # SQLAlchemy async setup
        ├── models.py         # ORM models
        ├── schemas.py        # Pydantic schemas
        ├── routes/           # 12 route modules
        └── services/         # 9 service modules
```
