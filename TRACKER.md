# Do-able - Build Tracker

## Layer 1: Single File Foundation

| Step | Status |
|------|--------|
| `doable.html` - CSS (Nord theme + layout + responsive) | done |
| `doable.html` - HTML structure (orbital ring, sidebar, topbar, all pages) | done |
| `doable.html` - JS data layer (localStorage read/write, ID generation) | done |
| `doable.html` - JS navigation (page switching, sidebar toggle, backdrop) | done |
| `doable.html` - Theme toggle (Nord Dark/Light/System with `prefers-color-scheme`) | done |

## Layer 2: Features

| Feature | Status |
|---------|--------|
| **Dashboard** | |
| Scratch notes CRUD + pin/unpin | done |
| Focus goals selector (max 3, dropdown from active tasks) | done |
| Focus goal status cycling (not_started → started → done → not_started) | done |
| Focus goal progress counter + confetti on all done | done |
| Focus goals auto-reset daily | done |
| Overdue tasks list (max 5) | done |
| Due today list (max 5) | done |
| Bar charts by priority (high/medium/low) | done |
| Bar charts by category (top 8) | done |
| Weekly/monthly recap table → Heatmap grid (53wk × 7day contribution grid) | done |
| Task roulette (pick random incomplete task) | done |
| "+ Add Task" button → navigates to Tasks page | done |
| Bento grid layout (2fr+1fr top, full-width analytics below) | done |
| Frog reading book (empty state when no tasks) | done |
| **Tasks (List View)** | |
| Sortable table with configurable columns | done |
| Two-step sort popover (field → direction) with removable chips | done |
| Data filters (status, priority, category, due range) | done |
| Column visibility toggle (tags, category, time, annotations, dependencies, recurrence) | done |
| Column visibility persisted to `doable_taskColumns` | done |
| Pagination (configurable per-page) | done |
| Quick-add input (title only, no priority dropdown) | done |
| Rotating motivational quote (28 quotes, no consecutive repeat) | done |
| **Tasks (Kanban View)** | |
| Grouped by category with task count per column | done |
| Drag-and-drop to reassign category | done |
| Drop zone at column bottom | done |
| Column visibility (tags, annotations, dependencies, recurrence) shown on cards | done |
| **Tasks (Calendar View)** | |
| Month grid with day numbers and navigation | done |
| Week view with hourly time slots (07:00–22:00) | done |
| Priority dot indicators on overflow days | done |
| Expandable day task popover on click | done |
| Multi-day bar rendering for spanning tasks | done |
| Recurring task previews (auto-calculated next occurrence) | done |
| Drag-and-drop reschedule between days | done |
| Jump-to-date date picker | done |
| Today indicator with pulse animation | done |
| Overdue glow (red inset shadow) on past-due days | done |
| Time-labelled tasks in week view | done |
| **Tasks (Eisenhower Matrix)** | |
| 2×2 grid (Do First / Schedule / Delegate / Eliminate) | done |
| Quadrant assignment by urgency (due_date) × importance (priority) | done |
| Task count per quadrant | done |
| Click task title to open detail | done |
| Hint text explaining quadrant logic | done |
| **Task Detail (Full-Page Editor)** | |
| Inline editing: title, description, priority, status | done |
| Due date, start date, time inputs | done |
| Category: hybrid select dropdown + type-new input (Enter to add) | done |
| Tags: pill display + input with autocomplete datalist | done |
| Recurrence setting (none / daily / weekly / monthly) | done |
| Dependencies: searchable by title, status badges, priority dots | done |
| Incomplete dependency warning banner | done |
| "Blocks N other tasks" indicator | done |
| Annotations/notes timeline with relative timestamps | done |
| Created/updated timestamps | done |
| Soft-delete to Bin with confirmation-less delete button | done |
| Save button → navigates back | done |
| Unsaved changes warning on navigation | done |
| **Bin** | |
| Table of deleted tasks with deletion date + original status | done |
| Restore individual tasks | done |
| Empty bin with single confirmation | done |
| Empty state display | done |
| **Activity Log** | |
| Chronological feed (newest first) | done |
| Filter by action type (all/created/completed/deleted/restored/updated) | done |
| Colored dots by action type | done |
| Paginated (25 per page) | done |
| Keeps last 500 entries / last 10 days | done |
| **Settings** | |
| Collapsible accordion sections (Appearance, Display, Backups, Export, Data, Categories) | done |
| Theme: Nord Dark / Nord Light / System | done |
| Frog companion toggle (checkbox) | done |
| Date mode: Smart (relative) / ISO | done |
| Tasks per page number input | done |
| Backup: download full data as JSON | done |
| Restore: upload JSON file to restore all data | done |
| Export: JSON / CSV / Markdown | done |
| Clear all data with double confirmation | done |
| Load sample tasks | done |
| Remove sample tasks | done |
| Category management: list with task counts + delete button | done |
| **Global** | |
| Global search (debounced 300ms, across title + description) | done |
| Recurring tasks auto-create next instance on completion | done |
| Sample data on first run (20 tasks + 4 scratch notes) | done |
| Empty states for all lists/tables | done |
| Toast notifications (success/error/info, 3s auto-dismiss) | done |
| Confetti animation on task completion / focus goals done | done |
| Modal overlay system | done |

## Layer 3: Polish

| Step | Status |
|------|--------|
| Orbital ring sidebar (fixed overlay, opens from left with backdrop) | done |
| Responsive layout (mobile: single-column grids, smaller ring/padding) | done |
| System theme support (`prefers-color-scheme` listener) | done |
| Custom scrollbar styling | done |

## Frog Companion (7 States)

| State | Description | Status |
|-------|-------------|--------|
| Idle | Gentle breathing animation (most of the time) | done |
| Sleep | Dozes off with floating 💤 Zzz bubbles (~10s) | done |
| Stretch | Lazy stretch animation (~1.8s) | done |
| Walk | Alternating waddle walk across screen (~4.2s) | done |
| Happy | Bounces excitedly on completion/click (~2.5s) | done |
| Peek | Peeks up from below (~2.2s) | done |
| Perch | Hops to random new position on click (~1.2s) | done |
| Auto-cycle | Random idle/sleep/stretch cycle (12–30s interval) | done |
| Click behavior | Happy → hop to new position with CSS transition | done |
| Confetti trigger | Gets happy when confetti fires | done |
| Modal peek | Peeks behind modal overlay when open | done |
| Toast rider | Appears inside toast notifications | done |
| Window resize | Repositions to stay within viewport | done |
| Toggle on/off | Via Settings → Appearance → Frog companion checkbox | done |

## Layer 4: Backend

| Step | Status |
|------|--------|
| FastAPI backend with async SQLAlchemy + SQLite | done |
| Task CRUD endpoints (`/api/tasks`) | done |
| Config, Focus, Notes endpoints | done |
| Sync endpoint (`/api/sync/full`) with id_map + depends_on resolution | done |
| Dashboard, Search, Backup, Bin, Activity, Export endpoints | done |
| Frontend API client with background sync (`_initApi`, `_syncFull`, `_syncCfg`, `syncFocus`) | done |
| Frontend reads from localStorage cache, writes fire background API calls | done |
| `doable.html` served at `GET /` via FileResponse | done |
| `start.bat` / `stop.bat` convenience scripts | done |
| Updated README.md with new architecture | done |
| Updated design.md, api.md, directory-structure.md, TRACKER.md | done |
| Backend pushed to repo (removed from .gitignore) | done |
