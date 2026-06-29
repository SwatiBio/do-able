# Do-able

A task manager that runs in your browser with an optional Python backend for persistence.

## How it works

Two parts:

1. **Frontend** (`index.html` + `src/`): An HTML shell with JS split across `src/app.js`, `src/ui.js`, `src/events.js`. No build step, no dependencies. Open it in a browser and it works.
2. **Backend** (`backend/`): A FastAPI server that saves your data to SQLite. Your tasks survive even if you clear your browser data.

The app reads from localStorage (instant) and writes to both localStorage and the backend (in the background). If the server is down, the app keeps working from localStorage alone.

## Clone and run

### What you need

- Python 3.10 or newer
- Git
- A web browser

### Steps

```bash
git clone https://github.com/SwatiBio/do-able.git
cd do-able/backend

python -m venv .venv

# Activate it
.venv\Scripts\Activate.ps1        # Windows PowerShell
source .venv/Scripts/activate     # Windows Git Bash
source .venv/bin/activate        # Mac/Linux

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open `http://localhost:8000` in your browser.

On Windows you can also double-click `start.bat` from the project root. It starts the server and opens the browser for you. Use `stop.bat` to kill it.

### First run

The first time you open the app, an onboarding modal asks how you want to start: try sample tasks, import from CSV, or start empty. You can remove samples later from Settings > Data > Remove Samples.

A SQLite database gets created automatically at `~/.todo/todo.db`. No setup needed.

### Without the backend

You can open `index.html` directly in a browser without running any server. Everything works offline using localStorage. The only downside is your data lives and dies with the browser.

### On your phone

1. Make sure your phone and laptop are on the same WiFi
2. Find your laptop's IP address (run `ipconfig` in terminal, look for IPv4 under Wi-Fi)
3. Open `http://YOUR_IP:8000` on your phone's browser
4. On Android (Chrome): tap the three dots menu > "Add to Home screen"
5. On iPhone (Safari): tap the Share button > "Add to Home Screen"

The app is a PWA, so once added to your home screen it runs in its own window without a browser address bar.

## Features

- **Home page** (Win95-inspired desktop) shown on first load: a retro dialog box with natural-language quick-add, advanced task form, priority buttons, clock widget, desktop icons, and context menu. Theme-aware. "Go to Main App" navigates to Dashboard.

### Views

- **Dashboard** with scratch notes, daily focus goals, overdue and due-today lists, weekly completion summary with trend, daily streak, My Day section, heatmap grid, and task roulette
- **Task List** with sortable columns, two-step sort, filters, column toggle, pagination. Shows dependency count and blocks-N indicator per task
- **Kanban** grouped by category with colored headers, drag-and-drop to reassign, cards showing deps, tags, annotations, and blocks count
- **Calendar** with month and week views, multi-day bars, recurring task previews, drag-and-drop reschedule, jump-to-date, and time blocking in week view
- **Eisenhower Matrix** with four quadrants based on priority and due date urgency. A hint banner appears when you have more than 15 active tasks
- **Task Detail** as a full-page editor with recent activity panel, inline editing for every field, subtasks, dependencies, annotations, attachments, and recurrence

### Task management

- Natural language quick-add: type "Buy milk tomorrow high" and it parses the due date and priority
- Subtasks with parent/child relationships and fold/unfold toggle
- Task templates: save any task as a template, apply from quick-add or detail page. Templates sync to the backend
- Recurring tasks (daily, weekly, monthly) with series support: stop, edit, and automatic instance creation that preserves files, time, and dependencies
- Dependencies between tasks with incompletion warnings and blocks-N indicators in list and kanban views
- Attachments: upload up to 5 files (2 MB each) per task, stored as base64
- Annotations timeline on each task
- Soft-delete with a Bin for restoring or permanently deleting. Pre-delete warnings for subtasks and dependents
- Task states: not started, in progress, done, cancelled

### Smart features

- Focus mode: a distraction-free modal that aggregates your focus goals, overdue, due-today, and a random task picker into one screen
- My Day: daily planner showing overdue, due-today, and focus goals
- Heatmap grid: GitHub-style contribution calendar showing your completion density
- Daily streak: consecutive days with at least one completed task
- Weekly progress: completion count with trend vs last week
- Task roulette: pick a random incomplete task
- Smart reminders: browser notifications for due and overdue tasks (opt-in via Settings)
- Global search across task titles and descriptions
- CSV import: bring tasks from any CSV file with a "title" column

### Accessibility

- ARIA labels on icon-only buttons, landmark roles on navigation and banner
- Keyboard navigation with focus-visible outlines
- Modal focus trap with Tab cycling and Escape to close
- Offline indicator badge when backend is unreachable
- Loading state on initial page load

### Extras

- First-run onboarding with three start options (samples, CSV import, or empty)
- Frog companion: an interactive SVG frog with 7 states that auto-cycles and reacts to your actions
- Confetti on task completion
- Nord color theme (dark, light, and system-aware modes)
- Category colors with per-category color pickers in Settings
- Tufte-inspired design: no decorative illustrations, no shadows, no gradients
- PWA support: installable on desktop and mobile, works offline
- Export tasks as JSON, CSV, or Markdown
- Backup and restore via JSON files
- Activity log tracking 11 event types: created, started, completed, cancelled, deleted, restored, updated, dependency removed, rescheduled, recurred, series stopped

## License

MIT
