# Do-able

A local-first task manager in a single HTML file. No server, no build step, no dependencies.

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/SwatiBio/do-able.git
cd do-able
```

### 2. Open the app

Just open `doable.html` in any modern browser (Chrome, Firefox, Edge, Safari).

That's it. No install, no build, no server.

### 3. Start using

The app loads with sample data on first run so you can explore right away. All data stays in your browser's `localStorage` - nothing is sent anywhere.

## Things to Keep in Mind

- **Your data lives in the browser.** Clearing your browser cache or cookies will delete everything. Use **Settings → Backups → Download Backup** regularly.
- **One browser, one device.** There is no sync or cloud storage. Each browser on each device has its own data. Use the backup/restore feature to move data between devices.
- **Works offline.** Once loaded, the app runs entirely in the browser with no network requests.
- **No account needed.** No sign-up, no login, no tracking.
- **This is a single HTML file.** All CSS and JavaScript are embedded inside `doable.html`. If you know HTML/CSS/JS, you can edit it directly.
- **The app stores data under `doable_` keys in `localStorage`.** You can inspect or edit it from your browser's dev tools.

## Features

**5 pages** in a collapsible orbital-ring sidebar (opens from left with backdrop overlay):

- **Dashboard** - scratch notes with pin/unpin, daily focus goals (max 3, status cycling by click, progress counter with confetti on all done), overdue and due-today task lists, priority and category bar charts, weekly/monthly completion recap table. "+ Add Task" button navigates to the Tasks page.
- **Tasks** - three view modes toggled via icon buttons:
  - **List** - sortable table with two-step popover sort (field → direction), data filters (status/priority/category/due range), column visibility toggle (tags/category/time/annotations/dependencies/recurrence) persisted to `doable_taskColumns`, pagination
  - **Kanban** - grouped by category with drag-and-drop to reassign, task count per column, drop zone
  - **Calendar** - month grid + week view with hourly time-blocking; multi-day bars, recurring task previews, drag-and-drop reschedule, jump-to-date picker, today indicator with pulse animation, overdue glow on past-due days
  - Quick-add input (title only, no priority dropdown) at the top
  - Rotating motivational quote displayed above tasks
  - Global search (debounced, across title + description, in topbar)
- **Task Detail** - full-page editor (not a modal) with inline editing for title, description, priority, status, due date, start date, time, category (hybrid select + type-new input), tags (with autocomplete datalist), recurrence (daily/weekly/monthly), dependencies (with incompletion warning and "blocks N tasks" indicator), annotations/notes timeline, created/updated timestamps. Unsaved changes warning on navigation away. Soft-delete to Bin.
- **Bin** - view soft-deleted tasks with deletion date and original status, restore individual tasks, empty bin completely with confirmation
- **Activity Log** - chronological feed of all mutations, filterable by action type (created/completed/deleted/restored/updated), paginated (25 per page), retains latest 500 entries
- **Settings** - collapsible accordion sections for:
  - **Appearance**: Nord Dark / Nord Light / System theme, frog companion toggle (SVG with 7 states)
  - **Display**: date mode (smart relative or ISO), tasks per page
  - **Backups**: download full backup as JSON, restore from JSON upload
  - **Export**: tasks as JSON, CSV, or Markdown
  - **Data**: clear all data (double confirmation), load or remove sample tasks
  - **Categories**: manage and delete unused categories (tasks become uncategorized)

**Extra touches:**
- Frog companion - an interactive SVG frog with 7 states (idle, sleep, stretch, walk, happy, peek, perch); random auto-cycling (12-30s), click-to-happy with teleport, happy on confetti events, reposition on window resize
- Confetti animation on task completion and when all daily focus goals are done
- Toast notifications for all actions (success/error/info)
- Recurring tasks auto-create next instance on completion (daily/weekly/monthly)
- Soft-delete (tasks go to Bin instead of permanent deletion)
- Unsaved changes warning when leaving the task detail page
- System theme detection via `prefers-color-scheme`
- Sample data on first run: 20 tasks with varied statuses/priorities/categories/tags/dependencies/recurrence/notes, 4 scratch notes (2 pinned)

**Task object fields:** `id`, `title`, `description`, `status` (not_started/started/done), `priority` (high/medium/low), `due_date`, `start_date`, `time`, `category`, `tags[]`, `recur` (daily/weekly/monthly/null), `depends_on[]`, `notes[]` (each with id/text/timestamp), `created_at`, `updated_at`, `deleted_at`, `_sample` (flag for sample data).

**Design:** Nord palette (dark and light), Tufte-inspired (no decorative illustrations, no shadows, no gradients - color only for semantic encoding, bar charts instead of sparklines, data labels instead of legends, space-only separation).

## License

[MIT](LICENSE) © SwatiBio
