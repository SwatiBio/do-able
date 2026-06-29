# Do-able

> **Live demo → [swatibio.github.io/do-able](https://swatibio.github.io/do-able/)**  
> *Note: the demo is frontend-only — sync, dashboards, and other backend features won't work.*

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

### Views
Dashboard, Task List (sortable/filterable), Kanban (drag-drop by category), Calendar (month/week with recurring previews), Eisenhower Matrix, full-page Task Detail with subtasks/deps/annotations.

### Task management
Natural language quick-add, subtasks, recurrence (daily/weekly/monthly), dependencies, templates, attachments (5×2 MB), annotations timeline, soft-delete with Bin, tags, categories, status states.

### Smart
Focus mode, My Day planner, heatmap grid, daily streak, weekly progress, task roulette, smart reminders (opt-in), global search, CSV import.

### Accessibility
ARIA labels, keyboard navigation, modal focus trap, offline indicator, loading states.

### Extras
Onboarding wizard, frog companion, confetti, Nord themes (dark/light/system), Win95-inspired design across all views, PWA installable offline, export (JSON/CSV/MD), backup/restore, activity log (11 event types).

## License

MIT
