# Do-able - API Reference

Do-able uses a dual-layer data system. The frontend caches everything in localStorage for instant reads. Every write updates localStorage first, then syncs to the FastAPI backend which persists to SQLite.

## Frontend storage

All data lives in localStorage under the `doable_` prefix.

### doable_tasks

Array of task objects. Each task:

```json
{
  "id": "k3x8a9b2c",
  "title": "Buy milk",
  "description": "",
  "status": "not_started",
  "priority": "high",
  "due_date": "2026-06-25",
  "start_date": null,
  "time": null,
  "category": "personal",
  "tags": ["errands"],
  "recur": null,
  "depends_on": [],
  "parent_id": null,
  "files": [],
  "notes": [],
  "created_at": "2026-06-21T10:00:00.000Z",
  "updated_at": "2026-06-21T10:00:00.000Z",
  "deleted_at": null,
  "_sample": true
}
```

### doable_activity

Array of activity entries (newest first). Max 500 entries, capped to 10 days.

```json
{
  "id": "m4x9c2d1e",
  "task_id": "k3x8a9b2c",
  "action": "created",
  "details": "Buy milk",
  "timestamp": "2026-06-21T10:00:00.000Z"
}
```

Actions: created, completed, deleted, restored, updated.

### doable_config

```json
{
  "theme": "nord-dark",
  "date_mode": "smart",
  "per_page": 25,
  "frog_enabled": false
}
```

### doable_notes

Array of scratch pad notes.

```json
{
  "id": "n1a2b3c4d",
  "text": "Ideas for project...",
  "pinned": true,
  "created_at": "2026-06-21T10:00:00.000Z",
  "updated_at": "2026-06-21T10:00:00.000Z"
}
```

### doable_focus

Map of date to task ID array. Max 3 goals per day. Old dates are cleared on startup.

```json
{
  "2026-06-21": ["k3x8a9b2c", "m7d4e5f6g"]
}
```

### doable_taskColumns

Array of visible column keys in list view.

```json
["priority", "status", "due", "tags", "category"]
```

### do_templates

Array of saved task templates.

```json
[
  {
    "name": "Weekly report",
    "title": "Weekly status report",
    "description": "Summarize this week's progress",
    "priority": "high",
    "category": "work",
    "tags": ["reports"],
    "recur": "weekly"
  }
]
```

## Frontend functions

All defined globally in doable.html.

| Function | What it does |
|----------|-------------|
| getTasks() | Returns all tasks from localStorage |
| saveTasks(tasks) | Saves tasks to localStorage and syncs to API |
| getActivity() | Returns activity log |
| saveActivity(entries) | Saves activity log |
| getConfig() | Returns config object |
| saveConfig(config) | Saves config and syncs to API |
| getNotes() | Returns scratch notes |
| saveNotes(notes) | Saves notes and syncs to API |
| getFocus() | Returns focus goals map |
| saveFocus(focus) | Saves focus goals and syncs to API |
| getTemplates() | Returns saved templates from localStorage |
| saveTemplates(t) | Saves templates to localStorage |
| logActivity(taskId, action, details) | Adds an activity entry |
| quickAddTask() | Creates a task from the quick-add input (parses natural language) |
| toggleTaskDone(id, checked) | Toggles completion, fires confetti, handles recurrence |
| showTaskDetail(id) | Opens the full-page task editor |
| handleRecurrence(task) | Creates the next instance of a recurring task |
| createBackup() | Downloads all data as JSON |
| restoreBackup(event) | Restores data from a JSON file |
| exportData(format) | Exports tasks as JSON, CSV, or Markdown |
| navigateTo(page) | Switches between pages |
| cycleTheme() | Cycles through Nord Dark, Nord Light, System |
| fireConfetti() | Triggers confetti animation |
| toast(msg, type) | Shows a toast notification |
| toggleFrog(on) | Enables or disables the frog companion |
| pickRandomTask() | Picks a random incomplete task |
| applyTemplate(name) | Creates a task from a template |
| requestNotifPermission() | Requests browser notification permission |
| checkDueTasks() | Sends notifications for due/overdue tasks |

### Internal API client

| Function | What it does |
|----------|-------------|
| _initApi() | Loads tasks, config, notes, focus from the API on startup |
| _syncFull() | Bulk syncs tasks/notes/config to POST /api/sync/full |

## Backend REST API

Base URL: http://localhost:8000

### Tasks

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/tasks | List tasks (supports search, status, priority, category, due, flat, per_page query params) |
| POST | /api/tasks | Create a task |
| GET | /api/tasks/{id} | Get a single task |
| PUT | /api/tasks/{id} | Update a task |
| DELETE | /api/tasks/{id} | Soft-delete a task |
| POST | /api/tasks/{id}/done | Mark done (triggers recurrence) |
| POST | /api/tasks/{id}/undone | Reopen a done task |
| POST | /api/tasks/{id}/note | Add an annotation |

### Config and Focus

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/config | Get config |
| PUT | /api/config | Update config |
| GET | /api/focus | Get focus goals |
| PUT | /api/focus | Update focus goals |

### Scratch Notes

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/notes | List notes |
| POST | /api/notes | Create a note |
| PUT | /api/notes/{id} | Update a note |
| DELETE | /api/notes/{id} | Delete a note |

### Sync

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/sync/full | Bulk import tasks, notes, config. Body: {tasks, notes, config}. Returns {id_map, tasks, notes} for ID remapping. |

### Dashboard and Search

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/dashboard | Analytics data |
| GET | /api/search?q= | Full-text search across tasks |

### Backups

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/backups | List backup files |
| POST | /api/backups | Create a backup |
| POST | /api/backups/{filename}/restore | Restore from a backup |

### Bin

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/bin | List deleted tasks |
| POST | /api/bin/{id}/restore | Restore a deleted task |
| DELETE | /api/bin | Empty the bin |

### Activity and Export

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/activity | Activity log entries |
| GET | /api/export/{fmt} | Export as json, csv, or markdown |

## Data flow

```
User action -> Event handler -> JS function -> localStorage (instant)
                                                      |
                                                API call (background)
                                                      |
                                                FastAPI -> SQLite
```

All reads are synchronous localStorage operations. Every write updates localStorage immediately and then makes an API call to persist the data server-side.

## Features

| Feature | How it works |
|---------|-------------|
| Natural language quick-add | Parses keywords like "tomorrow", "high", "next monday" from the input and strips them from the title |
| Subtasks | parent_id field on tasks, indented in list view with fold toggle |
| Templates | Save task structures to localStorage, apply from quick-add dropdown or detail page |
| Attachments | File upload stored as base64, max 5 files of 2 MB each |
| Time blocking | Click an hour slot in calendar week view to assign a task's time |
| My Day | Dashboard section grouping overdue, due-today, and focus goals |
| Smart reminders | Browser Notification API for due and overdue tasks |
| Recurrence | On completion, auto-creates the next instance with an incremented due date |
| Soft-delete | deleted_at timestamp, hidden from main views, visible in Bin |
| Dependencies | depends_on array with incompletion warnings and "blocks N tasks" indicator |
| Focus goals | Per-date map, max 3 per day, auto-clears daily, confetti when all done |
| Heatmap | GitHub-style 53-week contribution grid colored by completion density |
| Eisenhower Matrix | Four quadrants based on priority and due date proximity |
| Task roulette | Random incomplete task picker on the dashboard |
| PWA | Service worker caches shell files for offline use, installable on desktop and mobile |
