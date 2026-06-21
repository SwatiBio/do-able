import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Calendar, Kanban, LayoutList, Plus } from "lucide-react";
import { api } from "../api/client";
import { useDebounce } from "../hooks/useDebounce";
import type { Task, TaskSection } from "../types";

type ViewMode = "list" | "kanban" | "calendar";

export default function TaskList() {
  const [params] = useSearchParams();
  const [view, setView] = useState<ViewMode>("list");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sections, setSections] = useState<TaskSection[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(25);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [search, setSearch] = useState(params.get("search") || "");
  const debouncedSearch = useDebounce(search, 200);
  const [filterStatus, setFilterStatus] = useState("");
  const [group, setGroup] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const qs: Record<string, string> = { page: String(page), per_page: String(perPage) };
      if (debouncedSearch) qs.search = debouncedSearch;
      if (filterStatus) qs.status = filterStatus;
      if (group) qs.group = "due";
      const res = await api.tasks.list(qs);
      setTasks(res.tasks || []);
      setSections(res.sections || []);
      setTotal(res.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, debouncedSearch, filterStatus, group]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = async () => {
    if (!newTitle.trim()) return;
    await api.tasks.create({ title: newTitle.trim(), priority: newPriority });
    setNewTitle("");
    fetchTasks();
  };

  const cycleStatus = async (task: Task) => {
    const next: Record<string, string> = { not_started: "started", started: "done", done: "not_started" };
    await api.tasks.update(task.id, { status: next[task.status] || "not_started" });
    fetchTasks();
  };

  const pages = Math.max(1, Math.ceil(total / perPage));

  const renderTaskRow = (task: Task) => (
    <div
      key={task.id}
      className={task.status === "done" ? "status-done" : ""}
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 4px" }}
    >
      <input
        type="checkbox"
        checked={task.status === "done"}
        onChange={() => cycleStatus(task)}
        style={{ accentColor: "var(--accent)" }}
      />
      <span className={`priority-${task.priority}`} style={{ fontSize: 18, lineHeight: 1 }}>●</span>
      <Link to={`/tasks/${task.id}`} style={{ flex: 1, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {task.title}
      </Link>
      {task.due_date && (
        <span className={task.due_date < new Date().toISOString().slice(0, 10) && task.status !== "done" ? "overdue" : ""} style={{ fontSize: 12, minWidth: 80, textAlign: "right" }}>
          {task.due_date}
        </span>
      )}
      {task.tags.length > 0 && (
        <div style={{ display: "flex", gap: 4 }}>
          {task.tags.slice(0, 3).map((t) => (
            <span key={t} style={{ fontSize: 11, padding: "1px 6px", background: "var(--bg-muted)", borderRadius: 10, color: "var(--text-dim)" }}>{t}</span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, display: "flex", gap: 8 }}>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Quick add..."
            style={{ flex: 1, padding: "8px 12px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)" }}
          />
          <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} style={{ padding: "8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)" }}>
            <option value="low">Low</option>
            <option value="medium">Med</option>
            <option value="high">High</option>
          </select>
          <button onClick={addTask} className="btn btn-primary"><Plus size={16} /></button>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => setView("list")} className={`btn btn-ghost ${view === "list" ? "btn-primary" : ""}`}><LayoutList size={18} /></button>
          <button onClick={() => setView("kanban")} className={`btn btn-ghost ${view === "kanban" ? "btn-primary" : ""}`}><Kanban size={18} /></button>
          <button onClick={() => setView("calendar")} className={`btn btn-ghost ${view === "calendar" ? "btn-primary" : ""}`}><Calendar size={18} /></button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          style={{ flex: 1, padding: "6px 10px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)" }}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: "6px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)" }}>
          <option value="">All</option>
          <option value="not_started">Not Started</option>
          <option value="started">Started</option>
          <option value="done">Done</option>
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-dim)" }}>
          <input type="checkbox" checked={group} onChange={(e) => setGroup(e.target.checked)} />
          Group
        </label>
      </div>

      {view === "list" && (
        <div>
          {loading ? (
            <div style={{ color: "var(--text-dim)" }}>Loading...</div>
          ) : sections.length > 0 ? (
            sections.map((sec) => (
              <div key={sec.name} style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-dim)", marginBottom: 4 }}>{sec.name}</div>
                {sec.tasks.map(renderTaskRow)}
              </div>
            ))
          ) : tasks.length > 0 ? (
            tasks.map(renderTaskRow)
          ) : (
            <div style={{ color: "var(--text-faint)", padding: 24, textAlign: "center" }}>No tasks yet</div>
          )}
          {pages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16, fontSize: 13 }}>
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn btn-ghost">Prev</button>
              <span style={{ color: "var(--text-dim)", padding: "6px 0" }}>{page} / {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="btn btn-ghost">Next</button>
            </div>
          )}
        </div>
      )}

      {view === "kanban" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {["not_started", "started", "done"].map((status) => (
            <div key={status} style={{ background: "var(--bg-raised)", borderRadius: 8, padding: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-dim)", textTransform: "capitalize", marginBottom: 8 }}>{status}</div>
              {tasks.filter(t => t.status === status).map(t => (
                <div key={t.id} style={{ padding: "8px 10px", background: "var(--bg)", borderRadius: 4, marginBottom: 6 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span className={`priority-${t.priority}`}>●</span>
                    <Link to={`/tasks/${t.id}`} style={{ color: "var(--text)" }}>{t.title}</Link>
                  </div>
                  {t.due_date && <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>{t.due_date}</div>}
                  {t.tags.length > 0 && (
                    <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                      {t.tags.map(tag => <span key={tag} style={{ fontSize: 10, padding: "1px 5px", background: "var(--bg-muted)", borderRadius: 8, color: "var(--text-dim)" }}>{tag}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {view === "calendar" && (
        <CalendarView tasks={tasks} />
      )}
    </div>
  );
}

function CalendarView({ tasks }: { tasks: Task[] }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const tasksByDate: Record<string, Task[]> = {};
  tasks.forEach(t => {
    if (t.due_date) {
      if (!tasksByDate[t.due_date]) tasksByDate[t.due_date] = [];
      tasksByDate[t.due_date].push(t);
    }
  });

  const todayStr = now.toISOString().slice(0, 10);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <button onClick={() => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); }} className="btn btn-ghost">←</button>
        <span style={{ fontWeight: 600 }}>{monthNames[month]} {year}</span>
        <button onClick={() => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); }} className="btn btn-ghost">→</button>
        <button onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()); }} className="btn btn-ghost" style={{ fontSize: 12 }}>Today</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
        {dayNames.map(d => <div key={d} style={{ padding: 6, fontSize: 11, color: "var(--text-dim)", textAlign: "center" }}>{d}</div>)}
        {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayTasks = tasksByDate[dateStr] || [];
          return (
            <div
              key={day}
              style={{
                padding: "6px 8px",
                minHeight: 60,
                background: dateStr === todayStr ? "var(--bg-raised)" : "transparent",
                fontSize: 12,
                borderRadius: 2,
              }}
            >
              <div style={{ fontWeight: dateStr === todayStr ? 700 : 400 }}>{day}</div>
              {dayTasks.length > 0 && (
                <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 2 }}>
                  {dayTasks.slice(0, 3).map(t => (
                    <div key={t.id} style={{ fontSize: 10, display: "flex", gap: 3, alignItems: "center" }}>
                      <span className={`priority-${t.priority}`}>●</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                    </div>
                  ))}
                  {dayTasks.length > 3 && <span style={{ fontSize: 10, color: "var(--text-dim)" }}>+{dayTasks.length - 3} more</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
