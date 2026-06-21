import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import type { Task } from "../types";

export default function Bin() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.bin.list();
      setTasks(res.tasks || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const restore = async (id: number) => {
    await api.bin.restore(id);
    fetch();
  };

  const empty = async () => {
    if (!confirm("Permanently delete all binned tasks?")) return;
    await api.bin.empty();
    fetch();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontWeight: 600 }}>Bin</h2>
        {tasks.length > 0 && (
          <button onClick={empty} className="btn btn-danger">Empty bin</button>
        )}
      </div>
      {tasks.length === 0 ? (
        <div style={{ color: "var(--text-faint)", padding: 24, textAlign: "center" }}>Bin is empty</div>
      ) : (
        <div>
          {tasks.map(task => (
            <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 4px" }}>
              <span style={{ flex: 1, color: "var(--text-dim)", textDecoration: "line-through" }}>{task.title}</span>
              <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{task.status}</span>
              <button onClick={() => restore(task.id)} className="btn btn-ghost" style={{ fontSize: 12, color: "var(--green)" }}>Restore</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
