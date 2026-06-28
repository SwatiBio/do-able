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

The topbar is 52px tall. Left to right: global search input, centered page title (`#topbarTitle`), command palette trigger (⌘K / Ctrl+K), focus-mode button, theme-cycle button, offline badge.

## Pages

### Dashboard

A bento grid layout with two columns on top (scratch notes + focus goals) and a full-width analytics section below.

- Scratch notes with create, pin/unpin, delete
- Focus goals: pick up to 3 tasks per day, click to cycle their status, progress counter with confetti when all done. Prominent dashed-border prompt when no goals set.
- This Week card: tasks completed this week with trend vs last week
- Daily streak: consecutive days with completed tasks (⚡ for < 7 days, 🔥 for 7+)
- Focus mode: topbar button opens modal aggregating focus goals, overdue, due today, and roulette — distraction-free "what to work on now" view
- Overdue tasks list (max 5)
- My Day section showing overdue, due-today, and focus goals together
- Task roulette button that picks a random incomplete task
- Priority bar chart and category bar chart (top 8 categories)
- Heatmap grid: 53 weeks by 7 days, color-coded by completion density, month labels, today highlighted
- Frog reading a book when there are no tasks (empty state)

### Tasks

Four view modes:

**List**: Sortable table with configurable columns (tags, category, time, annotations, dependencies, recurrence). Two-step sort popover (pick field, then direction). Data filters for status, priority, category, due range. Pagination. Eisenhower Matrix hint banner when active task count exceeds 15. Deps column shows both directions: dep count + →N indicator (orange) when task blocks other active tasks.

**Kanban**: Columns grouped by category with colored headers. Drag-and-drop to reassign. Task count per column header. Cards have colored left border matching category color. Card meta shows due date, tags, annotations, deps (both directions: dep count + "blocks N" in orange when task blocks other active tasks), and recurrence.

**Calendar**: Month grid with day numbers and priority dot indicators. Week view with hourly time slots (07:00 to 22:00). Multi-day bars for spanning tasks. Recurring task previews. Drag-and-drop reschedule. Jump-to-date picker. Today pulse animation. Overdue glow on past-due days. Clicking an hour slot in week view opens a time-blocking popover to assign a task to that time.

**Eisenhower Matrix**: 2x2 grid. Quadrants assigned by urgency (due date proximity) and importance (priority level). Do First = high importance + urgent. Schedule = high importance + not urgent. Delegate = low importance + urgent. Eliminate = low importance + not urgent.

### Task Detail

Full-page editor (not a modal). Recent activity panel at top showing last 5 events for this task (created, updated, completed, rescheduled, dependency removed). Inline editing for title, description, priority, status, due date, start date, time, category, tags, recurrence, and dependencies. Subtask section with add/toggle/delete. Attachments section with file upload (5 files, 2 MB each). Annotations timeline. Save as Template button. Soft-delete to Bin.

### Bin

Table of soft-deleted tasks. Restore individual tasks, permanently delete single tasks, or empty the whole bin. Pre-delete warning when task has subtasks or dependents. Permanent deletion logs activity on dependent tasks.

### Activity Log

Chronological feed of all mutations. Filter by action type. Paginated (25 per page). Keeps the last 500 entries.

### Settings

Collapsible accordion sections:

- Appearance: theme (Nord Dark / Nord Light / System), frog companion toggle, notification enable button
- Display: date mode (smart relative or ISO), tasks per page
- Backups: download/restore JSON
- Import: CSV (tasks from file, requires "title" column)
- Export: JSON, CSV, Markdown
- Data: clear all, load/remove samples
- Categories: list with task counts, color picker per category, delete button
- Templates: list of saved templates with edit, delete
- Recurring Series: list of series with active/stopped status, edit, stop, and delete buttons

### Onboarding (first-run)

Modal shown on first visit (before `onboarding_seen` flag is set). Offers three choices: try sample tasks, import from CSV, or start empty. Includes a quick tour of key features (Kanban, Calendar, Focus Goals, Eisenhower, Templates, Recurring Series) and a prompt to personalize in Settings.

## Command Palette & Keyboard Shortcuts

A command palette (Ctrl/Cmd+K) provides fuzzy-search access to navigation, view switches, and actions. It opens as a centered modal dialog with a combobox input, grouped listbox (Navigation / Task views / Actions), and a footer hint bar (↑↓ navigate / ↵ select / Esc close). Selection highlights with the accent color; hints show the direct shortcut for each command where one exists.

A shortcuts help modal (Ctrl/Cmd+/) lists all bindings grouped by category.

### Global shortcuts

| Binding | Action |
|---------|--------|
| Ctrl/Cmd+K | Toggle command palette |
| Ctrl/Cmd+/ | Show keyboard shortcuts help |
| Ctrl/Cmd+↵ | New task (focuses the quick-add input on the Tasks page) |
| Ctrl/Cmd+⇧F | Focus mode |
| Ctrl/Cmd+⇧L | Toggle sidebar |
| Ctrl/Cmd+⇧1–5 | Navigate to Dashboard / Tasks / Bin / Activity / Settings |

### In-palette keys

↑↓ navigate, ↵ select, Esc close, Tab trapped.

## Theme

Nord palette via CSS custom properties, toggled by a `data-theme` attribute on the HTML element.

- `nord-dark`: dark slate background (#2e3440)
- `nord-light`: light grey background (#eceff4)
- `system`: follows the OS preference via `prefers-color-scheme`

Colors:
- Accent (#88c0d0 dark, #5e81ac light) for interactive elements
- Red (#bf616a) for high priority, overdue, danger, cancelled status
- Orange (#d08770) for medium priority, due today, in_progress status
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

## Accessibility

- **ARIA labels** on all icon-only buttons (sidebar ring, theme toggle, view toggles). Landmark roles on sidebar (`navigation`) and topbar (`banner`). Modal has `role="dialog"` with `aria-modal` and `aria-labelledby`. Toast container has `aria-live="polite"`.
- **Keyboard navigation**: `:focus-visible` outline (2px accent color) shows for keyboard users, suppressed for mouse clicks. Sidebar ring is keyboard-activatable (Enter/Space). Global shortcuts (Ctrl/Cmd+K palette, Ctrl/Cmd+/ help, Ctrl/Cmd+↵ new task, Ctrl/Cmd+⇧F focus, Ctrl/Cmd+⇧L sidebar, Ctrl/Cmd+⇧1–5 page nav) are active when no overlay is open. The command palette uses `role="dialog"` / `role="combobox"` / `role="listbox"` / `role="option"` with `aria-selected` and `aria-activedescendant` for screen-reader support.
- **Modal focus trap**: Tab and Shift+Tab cycle within the modal. Focus is saved on open and restored on close. Escape key closes the modal.
- **Offline indicator**: pulsing orange "Offline" badge in the topbar when backend is unreachable. All writes fall back to localStorage and sync on reconnection.
- **Loading state**: spinner overlay shown on initial page load until data fetch completes.

## Data model

Each task has these fields:

```
id            string (unique)
title         string
description   string
status        not_started | in_progress | done | cancelled
priority      high | medium | low
due_date      YYYY-MM-DD or null
start_date    YYYY-MM-DD or null
time          HH:mm or null
category      string
tags          array of strings
recur         daily | weekly | monthly or null
series_id     series ID or null (links recurring instances to a series)
depends_on    array of task IDs
parent_id     task ID or null (for subtasks)
files         array of {name, data, size, type}
annotations   array of {id, text, timestamp}
created_at    ISO datetime
updated_at    ISO datetime
deleted_at    ISO datetime or null
_sample       boolean (for sample data)
```

## Backend

FastAPI async server with SQLAlchemy 2.0 and SQLite (via aiosqlite).

38 REST endpoints under `/api/`:

- Tasks: CRUD, done/undone, add annotation
- Config: get/update
- Focus: get/update
- Notes: CRUD for scratch notes
- Templates: CRUD for task templates
- Series: CRUD + stop for recurring task series
- Sync: bulk import with ID remapping for dependencies and series
- Dashboard: analytics data
- Search: full-text across tasks
- Backups: list, create, restore
- Bin: list deleted, restore, hard delete single, empty
- Activity: log entries
- Import: CSV (tasks from file)
- Export: JSON, CSV, Markdown

The root route (`GET /`) serves `doable.html` as a static file.

## Tufte principles

1. Show the data. First-run onboarding is the only modal exception — it serves new-user orientation, not decoration.
2. Maximize the data-ink ratio. No decorative illustrations, no shadows, no gradients.
3. Erase non-data-ink. No box borders on cards, space-only separation.
4. Graphical integrity. Bar charts start at zero, no truncated axes.
5. Small multiples. CSS bar charts running vertically.
6. Layering and separation. Three-tier text hierarchy (text, dim, faint).
7. Word-data integration. Labels on data, no separate legends.
