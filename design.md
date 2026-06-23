# Do-able - Design

## Architecture

```
doable.html  <--->  FastAPI (Python)  <--->  SQLite
  (UI)                (REST API)           (database)
```

The frontend caches everything in the browser's localStorage for instant reads. Every write goes to localStorage first (so the UI responds immediately) and then to the backend server in the background. The backend persists data to a SQLite database.

If the server is offline, the frontend keeps working from localStorage. When connectivity returns, the next write syncs to the server.

## Layout

```
+----------+----------------------------------+
|          |  Topbar (search + theme toggle)   |
| Sidebar  +----------------------------------+
| (orbital |  Main Content Area               |
|  ring)   |  max-width 1100px, centered      |
|          |                                  |
+----------+----------------------------------+
```

The sidebar uses an "orbital ring" design: a 44px circular button fixed at the bottom-left corner of the screen. Clicking it slides open a 200px navigation panel from the left with a backdrop overlay. On mobile the ring shrinks and the sidebar takes the full width.

The topbar is 52px tall with a global search input on the left and a theme-cycle button on the right.

## Pages

### Dashboard

A bento grid layout with two columns on top (scratch notes + focus goals) and a full-width analytics section below.

- Scratch notes with create, pin/unpin, delete
- Focus goals: pick up to 3 tasks per day, click to cycle their status, progress counter with confetti when all done
- Overdue tasks list (max 5)
- My Day section showing overdue, due-today, and focus goals together
- Task roulette button that picks a random incomplete task
- Priority bar chart and category bar chart (top 8 categories)
- Heatmap grid: 53 weeks by 7 days, color-coded by completion density, month labels, today highlighted
- Frog reading a book when there are no tasks (empty state)

### Tasks

Four view modes:

**List**: Sortable table with configurable columns (tags, category, time, annotations, dependencies, recurrence). Two-step sort popover (pick field, then direction). Data filters for status, priority, category, due range. Pagination.

**Kanban**: Columns grouped by category. Drag-and-drop to reassign. Task count per column header.

**Calendar**: Month grid with day numbers and priority dot indicators. Week view with hourly time slots (07:00 to 22:00). Multi-day bars for spanning tasks. Recurring task previews. Drag-and-drop reschedule. Jump-to-date picker. Today pulse animation. Overdue glow on past-due days. Clicking an hour slot in week view opens a time-blocking popover to assign a task to that time.

**Eisenhower Matrix**: 2x2 grid. Quadrants assigned by urgency (due date proximity) and importance (priority level). Do First = high importance + urgent. Schedule = high importance + not urgent. Delegate = low importance + urgent. Eliminate = low importance + not urgent.

### Task Detail

Full-page editor (not a modal). Inline editing for title, description, priority, status, due date, start date, time, category, tags, recurrence, and dependencies. Subtask section with add/toggle/delete. Attachments section with file upload (5 files, 2 MB each). Annotations timeline. Save as Template button. Soft-delete to Bin.

### Bin

Table of soft-deleted tasks. Restore individual tasks or empty the whole bin.

### Activity Log

Chronological feed of all mutations. Filter by action type. Paginated (25 per page). Keeps the last 500 entries.

### Settings

Collapsible accordion sections:

- Appearance: theme (Nord Dark / Nord Light / System), frog companion toggle, notification enable button
- Display: date mode (smart relative or ISO), tasks per page
- Backups: download/restore JSON
- Export: JSON, CSV, Markdown
- Data: clear all, load/remove samples
- Categories: list with task counts, delete button
- Templates: list of saved templates, delete button

## Theme

Nord palette via CSS custom properties, toggled by a `data-theme` attribute on the HTML element.

- `nord-dark`: dark slate background (#2e3440)
- `nord-light`: light grey background (#eceff4)
- `system`: follows the OS preference via `prefers-color-scheme`

Colors:
- Accent (#88c0d0 dark, #5e81ac light) for interactive elements
- Red (#bf616a) for high priority, overdue, danger
- Orange (#d08770) for medium priority, due today, started status
- Green (#a3be8c) for low priority, done status, success
- Purple (#b48ead) for confetti accent

Typography: system sans-serif for UI, Georgia/serif for headings, monospace for data elements.

## Frog Companion

An interactive SVG frog that sits on the screen. Seven states:

- Idle: gentle breathing animation (most common)
- Sleep: dozes with floating Zzz bubbles
- Stretch: lazy stretch animation
- Walk: waddle walk across the screen
- Happy: bounces on task completion or click
- Peek: peeks behind the modal overlay
- Perch: hops to a new position

Auto-cycles between idle/sleep/stretch every 12 to 30 seconds. Clicking the frog triggers a happy animation and a hop to a new spot. Gets happy automatically when confetti fires. Rides inside toast notifications. Toggled in Settings.

## PWA

The app is a Progressive Web App. It has a service worker (`sw.js`) that caches the shell files (HTML, manifest, icon) for offline use. API routes are not cached. The manifest (`site.webmanifest`) defines the app name, display mode (standalone), theme colors, and icon. Users can install it on desktop and mobile.

## Data model

Each task has these fields:

```
id            string (unique)
title         string
description   string
status        not_started | started | done
priority      high | medium | low
due_date      YYYY-MM-DD or null
start_date    YYYY-MM-DD or null
time          HH:mm or null
category      string
tags          array of strings
recur         daily | weekly | monthly or null
depends_on    array of task IDs
parent_id     task ID or null (for subtasks)
files         array of {name, data, size, type}
notes         array of {id, text, timestamp}
created_at    ISO datetime
updated_at    ISO datetime
deleted_at    ISO datetime or null
_sample       boolean (for sample data)
```

## Backend

FastAPI async server with SQLAlchemy 2.0 and SQLite (via aiosqlite).

28 REST endpoints under `/api/`:

- Tasks: CRUD, done/undone, add note
- Config: get/update
- Focus: get/update
- Notes: CRUD for scratch notes
- Sync: bulk import with ID remapping for dependencies
- Dashboard: analytics data
- Search: full-text across tasks
- Backups: list, create, restore
- Bin: list deleted, restore, empty
- Activity: log entries
- Export: JSON, CSV, Markdown

The root route (`GET /`) serves `doable.html` as a static file.

## Tufte principles

1. Show the data. No splash screens or onboarding modals.
2. Maximize the data-ink ratio. No decorative illustrations, no shadows, no gradients.
3. Erase non-data-ink. No box borders on cards, space-only separation.
4. Graphical integrity. Bar charts start at zero, no truncated axes.
5. Small multiples. CSS bar charts running vertically.
6. Layering and separation. Three-tier text hierarchy (text, dim, faint).
7. Word-data integration. Labels on data, no separate legends.
