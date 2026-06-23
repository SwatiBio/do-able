# Do-able

A task manager that runs in your browser with an optional Python backend for persistence.

## How it works

Do-able has two parts:

1. **Frontend** (`doable.html`): A single HTML file with all CSS and JavaScript inside it. No build step, no dependencies. Just open it in a browser.
2. **Backend** (`backend/`): A FastAPI server that saves your data to a SQLite database. This means your tasks survive even if you clear your browser data.

By default the app reads from your browser's localStorage (instant) and writes to both localStorage and the backend server (in the background). If the server is down, the app still works fine from localStorage alone.

## Clone and run

### What you need

- Python 3.10 or newer
- Git
- A web browser (Chrome, Firefox, Edge, Safari all work)

### Steps

```bash
# Clone the repo
git clone https://github.com/SwatiBio/do-able.git
cd do-able

# Go into the backend folder
cd backend

# Create a virtual environment
python -m venv .venv

# Activate it
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# Windows Git Bash:
source .venv/Scripts/activate
# Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open `http://localhost:8000` in your browser.

On Windows you can also double-click `start.bat` from the project root. It starts the server and opens the browser for you. Use `stop.bat` to kill it.

### First run

The first time you open the app, it loads 20 sample tasks and 4 scratch notes so you can see how things work. You can remove them from Settings > Data > Remove Samples.

A SQLite database gets created automatically at `backend/.todo/todo.db`. No setup needed.

### Without the backend

You can open `doable.html` directly in a browser without running any server. Everything works offline using localStorage. The only downside is your data lives and dies with the browser.

### On your phone

1. Make sure your phone and laptop are on the same WiFi
2. Find your laptop's IP address (run `ipconfig` in terminal, look for IPv4 under Wi-Fi)
3. Open `http://YOUR_IP:8000` on your phone's browser
4. On Android (Chrome): tap the three dots menu > "Add to Home screen"
5. On iPhone (Safari): tap the Share button > "Add to Home Screen"

The app is a PWA, so once added to your home screen it runs in its own window without a browser address bar.

## Features

### Views

- **Dashboard** with scratch notes, daily focus goals, overdue and due-today lists, priority and category bar charts, a heatmap grid showing task completion over 53 weeks, a My Day section, and a task roulette that picks a random incomplete task
- **Task List** with sortable columns, two-step sort (pick field then direction), filters (status, priority, category, due date range), column visibility toggle, and pagination
- **Kanban** grouped by category with drag-and-drop to reassign
- **Calendar** with month and week views, multi-day bars, recurring task previews, drag-and-drop reschedule, jump-to-date picker, today pulse animation, and overdue glow on past-due days. Week view supports time blocking where you click an hour slot to assign a task to that time
- **Eisenhower Matrix** with four quadrants (Do First, Schedule, Delegate, Eliminate) based on priority and due date urgency
- **Task Detail** as a full-page editor with inline editing for every field

### Task management

- Natural language quick-add: type "Buy milk tomorrow high" and it parses the due date and priority automatically
- Subtasks with parent/child relationships and fold/unfold toggle in the list view
- Task templates: save any task as a template, apply it from the quick-add area or the detail page
- Attachments: upload up to 5 files (2 MB each) per task, stored as base64
- Dependencies between tasks with incompletion warnings
- Recurring tasks (daily, weekly, monthly) that auto-create the next instance on completion
- Annotations/notes timeline on each task
- Soft-delete with a Bin for restoring deleted tasks

### Smart features

- My Day: a daily planner on the dashboard showing overdue, due-today, and focus goals
- Heatmap grid: GitHub-style contribution calendar showing your completion density
- Task roulette: press a button to pick a random incomplete task
- Smart reminders: browser notifications for due and overdue tasks (opt-in via Settings)
- Global search across task titles and descriptions

### Extras

- Frog companion: an interactive SVG frog with 7 states (idle, sleep, stretch, walk, happy, peek, perch) that auto-cycles and reacts to your actions
- Confetti on task completion
- Nord color theme (dark, light, and system-aware modes)
- Tufte-inspired design: no decorative illustrations, no shadows, no gradients
- PWA support: installable on desktop and mobile, works offline
- Export tasks as JSON, CSV, or Markdown
- Backup and restore via JSON files
- Activity log tracking all changes

## Project structure

```
do-able/
  doable.html           The entire frontend (2200+ lines)
  start.bat             Starts the server and opens the browser (Windows)
  stop.bat              Kills the server (Windows)
  sw.js                 Service worker for PWA offline caching
  site.webmanifest      PWA manifest (app name, icons, colors)
  icon.svg              App icon for PWA and notifications
  backend/
    requirements.txt    Python dependencies
    app/
      main.py           FastAPI entry point and route registration
      database.py       SQLAlchemy async engine setup
      models.py         Database models (Task, Tag, Note, Config, etc.)
      schemas.py        Pydantic validation schemas
      routes/           API endpoint handlers (12 modules)
      services/         Business logic (10 modules)
    tests/              Backend tests
```

## API

The backend exposes 28 REST endpoints under `/api/`. See `api.md` for the full reference.

Main endpoints:

- `GET /` serves the frontend HTML
- `/api/tasks` for CRUD operations on tasks
- `/api/sync/full` for bulk importing data from the frontend
- `/api/config`, `/api/focus`, `/api/notes` for settings and scratch data
- `/api/dashboard` for analytics
- `/api/search` for full-text search
- `/api/backups`, `/api/bin`, `/api/activity`, `/api/export` for everything else

## License

MIT
