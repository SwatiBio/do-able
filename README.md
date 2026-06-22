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

The app loads with sample data on first run so you can explore right away. All data stays in your browser's `localStorage` — nothing is sent anywhere.

## Things to Keep in Mind

- **Your data lives in the browser.** Clearing your browser cache or cookies will delete everything. Use **Settings → Backups → Download Backup** regularly.
- **One browser, one device.** There is no sync or cloud storage. Each browser on each device has its own data. Use the backup/restore feature to move data between devices.
- **Works offline.** Once loaded, the app runs entirely in the browser with no network requests.
- **No account needed.** No sign-up, no login, no tracking.
- **This is a single HTML file.** All CSS and JavaScript are embedded inside `doable.html`. If you know HTML/CSS/JS, you can edit it directly.
- **The app stores data under `doable_` keys in `localStorage`.** You can inspect or edit it from your browser's dev tools.

## Features

**7 pages** in a collapsible sidebar:

- **Dashboard** — scratch notes, daily focus goals with status cycling, motivational quote, overdue/due today lists, task counts, bar charts (by priority and category), weekly/monthly recap, 30-day activity sparkline, recent activity feed
- **Tasks** — three view modes (sortable list with pagination, kanban with drag-and-drop, monthly calendar). Quick-add inline. Global search in topbar. Sortable columns, data filters, toggleable columns.
- **Task Detail** — full-page editor with inline editing for title, description, priority, status, due date, category, tags (with autocomplete), recurrence (daily/weekly/monthly), dependencies (with incompletion warnings), annotations timeline, timestamps
- **Bin** — view soft-deleted tasks, restore individual or empty completely
- **Activity Log** — chronological feed filterable by action type (created, completed, deleted, restored, updated), paginated
- **Settings** — collapsible accordion sections for:
  - **Appearance**: Nord Dark / Nord Light / System theme, frog companion toggle
  - **Display**: date mode (smart relative or ISO), tasks per page
  - **Backups**: download full backup as JSON, restore from JSON upload
  - **Export**: tasks as JSON, CSV, or Markdown
  - **Data**: clear all data (double confirmation), load or remove sample tasks

**Extra touches:**
- Frog companion — an interactive SVG frog that sleeps, stretches, walks, bounces when you complete tasks, and follows your clicks
- Confetti animation when all daily focus goals are done
- Toast notifications for all actions
- Recurring tasks auto-create next instance on completion
- Soft-delete (tasks go to Bin instead of being permanently deleted)
- Unsaved changes warning when leaving the task detail page
- System theme detection via `prefers-color-scheme`

**Design:** Nord palette (dark and light), Tufte-inspired (no box borders, no shadows, no gradients, color only for semantic encoding, sparklines instead of charts, labels on data not legends).

## License

[MIT](LICENSE) © SwatiBio
