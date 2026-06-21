# Do-able — Design

## Overview

A local-first task manager in a single HTML file. No server, no build step, no dependencies.
Open `doable.html` in any modern browser. All data stays in your browser's localStorage.

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
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
           ↕ localStorage API
┌─────────────────────────────┐
│     Browser localStorage    │
│  doable_tasks              │
│  doable_activity           │
│  doable_config             │
│  doable_notes              │
│  doable_focus              │
└─────────────────────────────┘
```

- All data persists in `localStorage` with the `doable_` prefix
- No network calls, no server, no database files
- Export/backup via JSON file download/upload
- Hashless client-side routing via JS state

## Views

### 1. Dashboard (`#dashboard`)
- Scratch pad notes (create, pin, delete)
- Focus goals for today (read-only, links to Focus page)
- Motivational quote
- Overdue tasks list (max 5)
- Due today list (max 5)
- Counts row (total, not started, started, done)
- Bar charts (by priority, by category)
- Weekly/monthly recap text
- 30-day activity sparkline
- Recent activity feed

### 2. Tasks (`#tasks`)
Three view modes toggled via icon buttons:

**List View** — sortable table, status/priority/category/due filters, grouping toggle, pagination
**Kanban View** — drag-and-drop columns (not started / started / done), status change on drop
**Calendar View** — month grid, dot indicators for priority, click to expand day tasks

Features:
- Quick-add inline (title + priority + Enter)
- Global search (debounced, across all views)
- Filters persist during session
- Sort by clicking column headers

### 3. Task Detail (modal)
Opens on clicking any task title:
- Inline editing: title, description, priority, status, due date, category
- Tag management with autocomplete from existing tags
- Recurrence setting (none / daily / weekly / monthly)
- Dependency links to other tasks
- Annotations timeline
- Created/updated timestamps
- Delete (soft-delete to Bin)

### 4. Focus (`#focus`)
- Select up to 3 tasks as today's goals
- Cycle status: not_started → started → done → not_started
- Progress counter ("2 of 3 done")
- Confetti animation when all complete
- Goals auto-reset daily (only today's shown)

### 5. Bin (`#bin`)
- List of soft-deleted tasks with deleted date
- Restore individual tasks
- Empty bin with confirmation

### 6. Activity Log (`#log`)
- Chronological feed of all mutations
- Filter by action type
- Keeps latest 500 entries

### 7. Settings (`#settings`)
- Theme: Nord Dark / Nord Light
- Date mode: Smart (relative) / ISO
- Tasks per page
- Backup: download full data as JSON
- Restore: upload JSON backup file
- Export: JSON / CSV / Markdown
- Clear all data (with double confirmation)

## Theme: Nord

CSS custom properties switching via `data-theme` attribute on `<html>`.

Auto-detection uses `prefers-color-scheme` (not implemented in single-file — default is Nord Dark, user can toggle in Settings).

## Tufte Principles

| # | Principle | Implementation |
|---|-----------|----------------|
| 1 | Show the data | No splash screens, no onboarding modals |
| 2 | Maximize data-ink ratio | No decorative illustrations, no shadows |
| 3 | Erase non-data-ink | No box borders, space-only separation |
| 4 | Erase redundant data-ink | Priority via color dot only |
| 5 | Graphical integrity | Bars start at zero, no truncated axes |
| 6 | Small multiples | Sparklines, CSS bar charts |
| 7 | Layering & separation | Sidebar dimmer than content |
| 8 | Micro/macro readings | Task list scannable, detail has full info |
| 9 | Smallest effective difference | Priority dots, status badges |
| 10 | Word-data integration | Labels on data, no legends |

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
  "category": "string",
  "tags": ["string"],
  "fields": {},
  "recur": "daily | weekly | monthly | null",
  "depends_on": ["task_id"],
  "notes": [{"id", "text", "timestamp"}],
  "created_at": "ISO datetime",
  "updated_at": "ISO datetime",
  "deleted_at": "ISO datetime | null"
}
```

## Storage

All under `localStorage` with `doable_` prefix key:

| Key | Contents |
|-----|----------|
| `doable_tasks` | Array of task objects |
| `doable_activity` | Array of activity log entries |
| `doable_config` | { theme, date_mode, per_page } |
| `doable_notes` | Array of scratch note objects |
| `doable_focus` | { "YYYY-MM-DD": ["task_id", ...] } |

## Files

```
todo-todo/
├── doable.html              # The entire app
├── backup-backend/          # Archived FastAPI backend
├── backup-frontend/         # Archived React frontend
├── start.bat                # Opens doable.html on Windows
├── start.sh                 # Opens doable.html on Linux/macOS
├── design.md                # This file
├── api.md                   # Data API reference
├── directory-structure.md   # File tree
├── TRACKER.md               # Build progress
└── todo-prompt.txt          # Original build prompt
```
