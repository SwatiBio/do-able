import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import type { Task } from "../types";

export default function Focus() {
  const [goals, setGoals] = useState<Task[]>([]);
  const [goalIds, setGoalIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState<Task[]>([]);
  const [showSelector, setShowSelector] = useState(false);

  const loadGoals = useCallback(async () => {
    try {
      const focus = await api.focus.get();
      setGoalIds(focus.task_ids);
      if (focus.task_ids.length === 0) {
        setGoals([]);
        return;
      }
      const promises = focus.task_ids.map((id) => api.tasks.get(id).catch(() => null));
      const results = await Promise.all(promises);
      setGoals(results.filter((t): t is Task => t !== null));
    } catch {}
  }, []);

  useEffect(() => { loadGoals(); }, [loadGoals]);

  useEffect(() => {
    if (!search.trim()) { setCandidates([]); return; }
    api.tasks.search(search).then(res => setCandidates(res.tasks?.filter(t => t.status !== "done" && !goalIds.includes(t.id)) || [])).catch(() => {});
  }, [search, goalIds]);

  const addGoal = async (taskId: number) => {
    const newIds = [...goalIds, taskId];
    await api.focus.set(newIds);
    setGoalIds(newIds);
    setSearch("");
    setShowSelector(false);
    loadGoals();
  };

  const removeGoal = async (taskId: number) => {
    const newIds = goalIds.filter(id => id !== taskId);
    await api.focus.set(newIds);
    setGoalIds(newIds);
    loadGoals();
  };

  const toggleDone = async (task: Task) => {
    if (task.status === "done") {
      await api.tasks.undone(task.id);
    } else {
      await api.tasks.done(task.id);
    }
    loadGoals();
  };

  const doneCount = goals.filter(g => g.status === "done").length;
  const allDone = goals.length > 0 && doneCount === goals.length;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Focus</h2>
        <div style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>
          {doneCount} of {goals.length} done
        </div>
      </div>

      {allDone && (
        <div style={{ textAlign: "center", fontSize: 48, marginBottom: 24 }}>
          🎉
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {goals.map((goal) => (
          <div
            key={goal.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "16px",
              background: "var(--bg-raised)",
              borderRadius: 8,
              border: goal.status === "done" ? "1px solid var(--green)" : "1px solid transparent",
            }}
          >
            <input
              type="checkbox"
              checked={goal.status === "done"}
              onChange={() => toggleDone(goal)}
              style={{ width: 20, height: 20, accentColor: "var(--green)" }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, textDecoration: goal.status === "done" ? "line-through" : "none", opacity: goal.status === "done" ? 0.6 : 1 }}>
                <span className={`priority-${goal.priority}`} style={{ marginRight: 6 }}>●</span>
                {goal.title}
              </div>
              {goal.due_date && <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{goal.due_date}</div>}
            </div>
            <button onClick={() => removeGoal(goal.id)} className="btn btn-ghost" style={{ color: "var(--red)", fontSize: 12 }}>Remove</button>
          </div>
        ))}
      </div>

      {goals.length < 3 && !showSelector && (
        <button onClick={() => setShowSelector(true)} className="btn btn-primary" style={{ width: "100%" }}>
          Add goal
        </button>
      )}

      {showSelector && (
        <div>
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks to add as goal..."
            style={{ width: "100%", padding: "8px 12px", borderRadius: 4, border: "1px solid var(--accent)", background: "var(--bg-raised)", marginBottom: 8 }}
          />
          {candidates.map(c => (
            <div
              key={c.id}
              onClick={() => addGoal(c.id)}
              style={{ padding: "8px 12px", cursor: "pointer", borderRadius: 4, background: "var(--bg-raised)", marginBottom: 4, fontSize: 13 }}
            >
              {c.title}
            </div>
          ))}
          {search.trim() && candidates.length === 0 && (
            <div style={{ fontSize: 13, color: "var(--text-dim)" }}>No matching tasks</div>
          )}
        </div>
      )}
    </div>
  );
}
