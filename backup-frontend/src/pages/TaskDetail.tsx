import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { api } from "../api/client";
import type { Task } from "../types";

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [noteText, setNoteText] = useState("");
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.tasks.get(Number(id)).then(setTask).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!task) return <div>Task not found</div>;

  const update = async (data: Record<string, unknown>) => {
    const updated = await api.tasks.update(task.id, data);
    setTask(updated);
    setEditing({});
  };

  const addTag = async () => {
    if (!newTag.trim()) return;
    await update({ tags: [...task.tags, newTag.trim()] });
    setNewTag("");
  };

  const removeTag = async (tag: string) => {
    await update({ tags: task.tags.filter(t => t !== tag) });
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    await api.tasks.addNote(task.id, noteText.trim());
    const refreshed = await api.tasks.get(task.id);
    setTask(refreshed);
    setNoteText("");
  };

  const softDelete = async () => {
    await api.tasks.delete(task.id);
    navigate("/tasks");
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
        <ArrowLeft size={16} /> Back
      </button>

      {editing.title !== undefined ? (
        <input
          autoFocus
          defaultValue={task.title}
          onBlur={(e) => update({ title: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && update({ title: (e.target as HTMLInputElement).value })}
          style={{ fontSize: 20, fontWeight: 600, width: "100%", padding: "4px 8px", background: "var(--bg-raised)", border: "1px solid var(--accent)", borderRadius: 4, outline: "none" }}
        />
      ) : (
        <h1 onClick={() => setEditing({ title: task.title })} style={{ fontSize: 20, fontWeight: 600, cursor: "pointer", marginBottom: 16 }}>
          {task.title}
        </h1>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 100, fontSize: 13, color: "var(--text-dim)" }}>Status</span>
          <input type="checkbox" checked={task.status === "done"} onChange={async () => {
            if (task.status === "done") await api.tasks.undone(task.id);
            else await api.tasks.done(task.id);
            const refreshed = await api.tasks.get(task.id);
            setTask(refreshed);
          }} style={{ accentColor: "var(--accent)" }} />
          <span style={{ fontSize: 13, color: "var(--text-dim)" }}>{task.status}</span>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 100, fontSize: 13, color: "var(--text-dim)" }}>Priority</span>
          <select value={task.priority} onChange={(e) => update({ priority: e.target.value })} style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)" }}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 100, fontSize: 13, color: "var(--text-dim)" }}>Due date</span>
          <input
            type="text"
            defaultValue={task.due_date || ""}
            placeholder="YYYY-MM-DD or relative..."
            onBlur={(e) => e.target.value !== (task.due_date || "") && update({ due_date: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && update({ due_date: (e.target as HTMLInputElement).value })}
            style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)", flex: 1 }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 100, fontSize: 13, color: "var(--text-dim)" }}>Category</span>
          <input
            type="text"
            defaultValue={task.category}
            onBlur={(e) => e.target.value !== task.category && update({ category: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && update({ category: (e.target as HTMLInputElement).value })}
            style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)", flex: 1 }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 100, fontSize: 13, color: "var(--text-dim)" }}>Recur</span>
          <select value={task.recur || ""} onChange={(e) => update({ recur: e.target.value || null })} style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)" }}>
            <option value="">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <span style={{ width: 100, fontSize: 13, color: "var(--text-dim)", display: "inline-block", marginBottom: 4 }}>Tags</span>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
            {task.tags.map(t => (
              <span key={t} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, padding: "2px 8px", background: "var(--bg-muted)", borderRadius: 10 }}>
                {t}
                <button onClick={() => removeTag(t)} style={{ color: "var(--text-dim)", fontSize: 14, lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTag()} placeholder="Add tag..." style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)", flex: 1, fontSize: 13 }} />
            <button onClick={addTag} className="btn btn-ghost"><Plus size={14} /></button>
          </div>
        </div>

        <div>
          <span style={{ width: 100, fontSize: 13, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>Description</span>
          <textarea
            defaultValue={task.description}
            rows={3}
            onBlur={(e) => e.target.value !== task.description && update({ description: e.target.value })}
            style={{ width: "100%", padding: "6px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)", resize: "vertical" }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Dependencies</h3>
        {task.depends_on.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {task.depends_on.map(d => (
              <div key={d.id} style={{ fontSize: 13 }}>
                <a href={`/tasks/${d.id}`} style={{ color: "var(--accent)" }}>{d.title}</a>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "var(--text-faint)" }}>No dependencies</div>
        )}
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Annotations</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
          {task.notes.map(n => (
            <div key={n.id} style={{ fontSize: 13, padding: "8px", background: "var(--bg-raised)", borderRadius: 4 }}>
              <div>{n.text}</div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>{new Date(n.timestamp).toLocaleString()}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <input value={noteText} onChange={(e) => setNoteText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addNote()} placeholder="Add annotation..." style={{ flex: 1, padding: "6px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)", fontSize: 13 }} />
          <button onClick={addNote} className="btn btn-ghost"><Plus size={14} /></button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--text-dim)", marginBottom: 24 }}>
        <span>Created: {new Date(task.created_at).toLocaleString()}</span>
        <span>·</span>
        <span>Updated: {new Date(task.updated_at).toLocaleString()}</span>
      </div>

      <button onClick={softDelete} className="btn btn-danger" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Delete task
      </button>
    </div>
  );
}
