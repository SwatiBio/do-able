import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pin, PinOff, Target, Trash2 } from "lucide-react";
import { api } from "../api/client";
import { useStats } from "../hooks/useStats";
import type { ScratchNote } from "../types";

export default function Dashboard() {
  const { data } = useStats();
  const [notes, setNotes] = useState<ScratchNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [morningOpen, setMorningOpen] = useState(true);

  const loadNotes = async () => {
    try {
      const res = await api.notes.list();
      setNotes(res.notes);
    } catch {}
  };

  useState(() => { loadNotes(); });

  const addNote = async () => {
    if (!newNote.trim()) return;
    await api.notes.create(newNote.trim());
    setNewNote("");
    loadNotes();
  };

  const togglePin = async (note: ScratchNote) => {
    await api.notes.update(note.id, { pinned: !note.pinned });
    loadNotes();
  };

  const deleteNote = async (id: number) => {
    await api.notes.delete(id);
    loadNotes();
  };

  const quotes = [
    "The secret of getting ahead is getting started.",
    "Done is better than perfect.",
    "The only way to do great work is to love what you do.",
    "Start where you are. Use what you have. Do what you can.",
  ];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div>
      <div
        style={{
          borderTop: "2px solid var(--accent)",
          padding: "16px 0",
          marginBottom: 24,
        }}
      >
        <button
          onClick={() => setMorningOpen(!morningOpen)}
          style={{ fontWeight: 600, fontSize: 15, color: "var(--accent)", marginBottom: 12, display: "block" }}
        >
          {morningOpen ? "▼" : "▶"} Morning
        </button>
        {morningOpen && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-dim)", marginBottom: 8 }}>
                <Target size={16} />
                <span>Focus Goals</span>
                <Link to="/focus" style={{ fontSize: 12 }}>Manage</Link>
              </div>
            </div>
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {notes.map((n) => (
                  <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", background: "var(--bg-raised)", borderRadius: 4 }}>
                    <button onClick={() => togglePin(n)} className="btn btn-ghost" style={{ padding: 2 }}>
                      {n.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                    </button>
                    <span style={{ flex: 1 }}>{n.text}</span>
                    <button onClick={() => deleteNote(n.id)} className="btn btn-ghost" style={{ padding: 2, color: "var(--red)" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addNote()}
                  placeholder="Add a scratch note..."
                  style={{ flex: 1, padding: "6px 10px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)" }}
                />
                <button onClick={addNote} className="btn btn-primary"><Plus size={16} /></button>
              </div>
            </div>
            <div style={{ fontStyle: "italic", color: "var(--text-dim)", fontSize: 13, padding: "8px 0" }}>
              "{quote}"
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
        <div>
          <span style={{ color: "var(--red)", fontWeight: 600 }}>{data?.overdue ?? 0}</span>
          <span style={{ color: "var(--text-dim)", marginLeft: 6, fontSize: 13 }}>overdue</span>
        </div>
        <div>
          <span style={{ color: "var(--yellow)", fontWeight: 600 }}>{data?.due_today ?? 0}</span>
          <span style={{ color: "var(--text-dim)", marginLeft: 6, fontSize: 13 }}>due today</span>
        </div>
      </div>

      {data && (
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, fontSize: 13, color: "var(--text-dim)", flexWrap: "wrap" }}>
          <span>Total: <strong style={{ color: "var(--text)" }}>{data.counts.total}</strong></span>
          <span>Active: <strong style={{ color: "var(--text)" }}>{(data.counts.not_started || 0) + (data.counts.started || 0)}</strong></span>
          <span>Done: <strong style={{ color: "var(--text)" }}>{data.counts.done}</strong></span>
          {data.task_count_by_day && data.task_count_by_day.length > 1 && (
            <Sparkline data={data.task_count_by_day} />
          )}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 600, fontSize: 13, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Analytics
        </h3>
        {data && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 6 }}>By Priority</div>
              {(["high", "medium", "low"] as const).map((p) => (
                <div key={p} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ width: 50, fontSize: 12, color: `var(--${p === "high" ? "red" : p === "medium" ? "orange" : "accent"})` }}>{p}</span>
                  <div style={{ flex: 1, height: 12, background: "var(--bg-raised)", borderRadius: 2 }}>
                    <div style={{ width: `${((data.by_priority[p] || 0) / Math.max(...Object.values(data.by_priority), 1)) * 100}%`, height: "100%", background: `var(--${p === "high" ? "red" : p === "medium" ? "orange" : "accent"})`, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text-dim)", width: 30, textAlign: "right" }}>{data.by_priority[p] || 0}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 6 }}>By Category</div>
              {Object.entries(data.by_category).map(([cat, count]) => (
                <div key={cat} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ width: 60, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis" }}>{cat}</span>
                  <div style={{ flex: 1, height: 12, background: "var(--bg-raised)", borderRadius: 2 }}>
                    <div style={{ width: `${(count / Math.max(...Object.values(data.by_category), 1)) * 100}%`, height: "100%", background: "var(--accent)", borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text-dim)", width: 30, textAlign: "right" }}>{count}</span>
                </div>
              ))}
              {Object.keys(data.by_category).length === 0 && <span style={{ fontSize: 12, color: "var(--text-faint)" }}>No categories</span>}
            </div>
          </div>
        )}
        {data && (
          <div style={{ marginTop: 16, fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7 }}>
            <p>{data.weekly_recap}</p>
            <p>{data.monthly_recap}</p>
          </div>
        )}
      </div>

      <div>
        <h3 style={{ fontWeight: 600, fontSize: 13, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Recent Activity
        </h3>
        {data?.recent_activity.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {data.recent_activity.map((a, i) => (
              <div key={i} style={{ fontSize: 13, color: "var(--text-dim)" }}>
                <span style={{ color: "var(--text)" }}>{a.action}</span>
                <span style={{ marginLeft: 6 }}>{new Date(a.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "var(--text-faint)" }}>No recent activity</div>
        )}
      </div>
    </div>
  );
}

function Sparkline({ data }: { data: { date: string; count: number }[] }) {
  if (data.length < 2) return null;
  const values = data.map(d => d.count);
  const max = Math.max(...values, 1);
  const w = 120, h = 24;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }} aria-label="Task completion sparkline">
      <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      <circle cx={w} cy={h - (values[values.length - 1] / max) * h} r={2} fill="var(--accent)" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
