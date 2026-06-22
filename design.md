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
│  doable_taskColumns        │
└─────────────────────────────┘
```

- All data persists in `localStorage` with the `doable_` prefix
- No network calls, no server, no database files
- Export/backup via JSON file download/upload
- Hashless client-side routing via JS state

## Views

### 1. Dashboard (`#dashboard`)
- Scratch pad notes (create, pin, delete)
- Focus goals selector (add up to 3 tasks, cycle status by click, progress counter, confetti on all done)
- Motivational quote (random from built-in list)
- Overdue tasks list (max 5)
- Due today list (max 5)
- Counts row (total, not started, started, done)
- Bar charts (by priority, by category)
- Weekly/monthly recap text
- 30-day activity sparkline
- Recent activity feed (last 5 entries)

### 2. Tasks (`#tasks`)
Three view modes toggled via icon buttons:

**List View** — sortable table with popover-based sort (field + direction), data filters (status/priority/category/due), column visibility toggle (tags, category, annotations, dependencies, recurrence), grouping toggle, pagination
**Kanban View** — drag-and-drop columns (not started / started / done), status change on drop
**Calendar View** — month grid with navigation, dot indicators for priority, click to expand day tasks

Features:
- Quick-add inline (title + priority + Enter)
- Global search (debounced, across all views, in topbar)
- Filters persist during session
- Sort by clicking column headers
- Column visibility saved to localStorage

### 3. Task Detail (page `#task-detail`)
Opens as a full page (not a modal) when clicking any task title:
- Inline editing: title, description, priority, status, due date, category
- Tag management with autocomplete from existing tags
- Recurrence setting (none / daily / weekly / monthly)
- Dependency links to other tasks with status badges and incompletion warning
- "Blocks N other tasks" indicator
- Annotations timeline with timestamps
- Created/updated timestamps
- Soft-delete to Bin
- Unsaved changes warning on navigation away

### 4. Bin (`#bin`)
- List of soft-deleted tasks with deleted date and original status
- Restore individual tasks
- Empty bin with confirmation

### 5. Activity Log (`#log`)
- Chronological feed of all mutations
- Filter by action type (created, completed, deleted, restored, updated)
- Paginated (25 per page)
- Keeps latest 500 entries

### 6. Settings (`#settings`)
Collapsible accordion sections:

- **Appearance**: Theme (Nord Dark / Nord Light / System), Frog companion toggle (SVG frog with idle, sleep, stretch, walk, happy states)
- **Display**: Date mode (Smart relative / ISO), Tasks per page
- **Backups**: Download full data as JSON, Restore from JSON upload
- **Export**: JSON / CSV / Markdown
- **Data**: Clear all data (double confirmation), Load / Remove sample tasks

## Theme: Nord

CSS custom properties switching via `data-theme` attribute on `<html>`.

Three modes:
- `nord-dark` (default) — dark slate background
- `nord-light` — light grey background
- `system` — follows `prefers-color-scheme` media query, re-evaluated on change

## Frog Companion

An interactive SVG frog that lives on the screen. Toggled in Settings.

States:
- **Idle** — sits and breathes gently (gentle scale animation)
- **Sleep** — dozes off with animated "Zzz" bubbles (most of the time)
- **Stretch** — lazy stretch animation once in a while
- **Walk** — walks across the screen, alternating per click
- **Happy** — bounces excitedly on confetti events or when clicked
- **Peek** — peeks up from below
- **Perch** — hops to a random new position on click

Behaviors:
- Random idle/sleep/stretch cycle (12-30s interval)
- Click the frog → it gets happy, then hops to a new random position
- Frogs gets happy when confetti fires (task completion)
- Responsive: repositions if window is resized

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
  "recur": "daily | weekly | monthly | null",
  "depends_on": ["task_id"],
  "notes": [{"id", "text", "timestamp"}],
  "created_at": "ISO datetime",
  "updated_at": "ISO datetime",
  "deleted_at": "ISO datetime | null",
  "_sample": true | undefined
}
```

## Storage

All under `localStorage` with `doable_` prefix key:

| Key | Contents |
|-----|----------|
| `doable_tasks` | Array of task objects |
| `doable_activity` | Array of activity log entries |
| `doable_config` | { theme, date_mode, per_page, frog_enabled } |
| `doable_notes` | Array of scratch note objects |
| `doable_focus` | { "YYYY-MM-DD": ["task_id", ...] } |
| `doable_taskColumns` | Array of visible column keys |

## Files

```
todo-todo/
├── doable.html              # The entire app
├── design.md                # This file
├── api.md                   # Data API reference
├── directory-structure.md   # File tree
├── TRACKER.md               # Build progress
└── .gitignore               # Ignored files
```
