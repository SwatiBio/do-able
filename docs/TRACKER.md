# Do-able - Build Tracker

## Layer 1: Foundation

| Step | Status |
|------|--------|
| CSS (Nord theme, layout, responsive) | done |
| HTML structure (orbital ring, sidebar, topbar, pages) | done |
| JS data layer (localStorage read/write, ID generation) | done |
| Offline write queue (dirty flag, replayed on reconnect) | done |
| File split: index.html / src/app.js / src/ui.js / src/events.js | done |
| JS navigation (page switching, sidebar toggle, backdrop) | done |
| Theme toggle (Nord Dark/Light/System) | done |

## Layer 2: Core Features

### Dashboard
| Feature | Status |
|---------|--------|
| Scratch notes (create, pin/unpin, delete) | done |
| Inline quick-add with NL parsing | done |
| Focus goals (max 3, dropdown, status cycling, cancelled reopen, progress counter, confetti) | done |
| Focus goals auto-reset daily | done |
| Overdue tasks list (max 5) | done |
| Bar charts by priority | done |
| Bar charts by category (top 8) | done |
| Heatmap grid (53 weeks x 7 days) | done |
| Heatmap empty state (compact preview when no done tasks) | done |
| My Day focus counter format (matches Focus Goals card) | done |
| prefers-reduced-motion gating (frog, confetti, pulse, toast, ring-hint) | done |
| Sidebar ring discoverability (pulse hint on first load) | done |
| Settings accordion chevron (CSS-drawn, no text a11y leak) | done |
| My Day section (overdue + due today + focus) | done |
| Task roulette (random incomplete picker) | done |
| Frog reading book (empty state) | done |

### Tasks: List View
| Feature | Status |
|---------|--------|
| Sortable table with configurable columns | done |
| Two-step sort popover (field then direction) | done |
| Data filters (status, priority, category, due range) | done |
| Column visibility toggle (persisted) | done |
| Pagination | done |
| Quick-add input with natural language parsing | done |
| Rotating motivational quote | done |
| Template selector dropdown | done |

### Tasks: Kanban
| Feature | Status |
|---------|--------|
| Grouped by category with task count | done |
| Drag-and-drop to reassign category | done |
| Drop zone at column bottom | done |

### Tasks: Calendar
| Feature | Status |
|---------|--------|
| Month grid with navigation | done |
| Week view with hourly time slots (07:00 to 22:00) | done |
| Priority dot indicators | done |
| Expandable day task popover | done |
| Multi-day bars | done |
| Recurring task previews | done |
| Drag-and-drop reschedule | done |
| Jump-to-date picker | done |
| Today pulse animation | done |
| Overdue glow | done |
| Time blocking (click hour slot to assign task time) | done |

### Tasks: Eisenhower Matrix
| Feature | Status |
|---------|--------|
| 2x2 grid (Do First / Schedule / Delegate / Eliminate) | done |
| Quadrant assignment by priority and due date | done |
| Task count per quadrant | done |
| Click task to open detail | done |

### Task Detail
| Feature | Status |
|---------|--------|
| Inline editing (title, description, priority, status) | done |
| Due date, start date, time inputs | done |
| Category (hybrid select + type-new) | done |
| Tags (pill display + autocomplete) | done |
| Recurrence (daily/weekly/monthly) | done |
| Dependencies (search, status badges, warnings) | done |
| Subtasks (add, toggle, delete, indent) | done |
| Attachments (file upload, max 5 x 2MB) | done |
| Annotations timeline | done |
| Save as Template button | done |
| Soft-delete to Bin | done |
| Stop recurring button (deactivates series, clears recurrence) | done |
| Unsaved changes warning | done |

### Bin
| Feature | Status |
|---------|--------|
| Deleted tasks table | done |
| Restore individual tasks | done |
| Empty bin with confirmation | done |

### Activity Log
| Feature | Status |
|---------|--------|
| Chronological feed | done |
| Filter by action type | done |
| Paginated (25 per page) | done |
| Keeps last 500 entries / 10 days | done |

### Settings
| Feature | Status |
|---------|--------|
| Theme (Nord Dark / Light / System) | done |
| Frog companion toggle | done |
| Notification enable button | done |
| Date mode (smart relative / ISO) | done |
| Tasks per page | done |
| Backup download/restore | done |
| Export (JSON / CSV / Markdown) | done |
| Clear all data | done |
| Load/remove samples | done |
| Category management | done |
| Template management | done |

## Command Palette & Keyboard Shortcuts

| Feature | Status |
|---------|--------|
| Command palette (Ctrl/Cmd+K, fuzzy search, grouped results) | done |
| Shortcuts help modal (Ctrl/Cmd+/) | done |
| Global shortcuts (Ctrl/Cmd+↵ new task, ⇧F focus, ⇧L sidebar, ⇧1-5 nav) | done |
| In-palette keyboard nav (↑↓ ↵ Esc, Tab trap) | done |
| Palette trigger button in topbar (⌘K / Ctrl+K) | done |
| ARIA roles (dialog/combobox/listbox/option) | done |

## Dashboard & Visual Polish

| Feature | Status |
|---------|--------|
| Asymmetric bento dashboard layout (My Day hero left, Focus/Roulette/Streak right) | done |
| Type refinement (text-wrap: balance, dark-mode letter-spacing, tabular-nums) | done |
| Color tokens (--bg-overlay modal surface, --accent-tint selected/hero) | done |
| Roulette spin animation (cycles titles before landing) | done |
| Palette open/close scale-in animation | done |
| Focus goals "All done!" complete state (green) | done |

## Layer 3: Polish

| Step | Status |
|------|--------|
| Orbital ring sidebar with backdrop | done |
| Responsive layout (mobile) | done |
| System theme support | done |
| Custom scrollbar | done |

## Frog Companion

| State | Status |
|-------|--------|
| Idle (breathing animation) | done |
| Sleep (Zzz bubbles) | done |
| Stretch | done |
| Walk (waddle across screen) | done |
| Happy (bounce on completion/click) | done |
| Peek (behind modal overlay) | done |
| Perch (hop to new position) | done |
| Auto-cycle (12-30s interval) | done |
| Toast rider | done |
| Modal peek | done |

## Layer 4: Backend

| Step | Status |
|------|--------|
| FastAPI async server with SQLAlchemy + SQLite | done |
| Task CRUD endpoints | done |
| Config, Focus, Notes endpoints | done |
| Sync endpoint with ID remapping | done |
| Dashboard, Search, Backup, Bin, Activity, Export endpoints | done |
| Frontend API client with background sync | done |
| index.html served at GET / | done |
| PWA (sw.js, manifest, service worker) | done |
| Natural language quick-add | done |
| Subtasks (parent_id, fold, indent) | done |
| Task templates (save/apply) | done |
| Attachments (file upload) | done |
| Time blocking (week view hour slots) | done |
| My Day (daily planner widget) | done |
| Smart reminders (browser notifications) | done |
| start.bat / stop.bat scripts | done |
| Updated README, design, api, directory-structure, TRACKER | done |
| State machine formalized (not_started → in_progress → done/cancelled → deleted, reopen paths) | done |
| docs/conceptual-model.md | done |
