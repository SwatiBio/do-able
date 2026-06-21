import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import type { ActivityEntry } from "../types";

export default function ActivityLog() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterAction, setFilterAction] = useState("");
  const perPage = 50;

  const fetch = useCallback(async () => {
    try {
      const params: Record<string, string> = { page: String(page), per_page: String(perPage) };
      if (filterAction) params.action = filterAction;
      const res = await api.activity.list(params);
      setEntries(res.entries);
      setTotal(res.total);
    } catch {}
  }, [page, filterAction]);

  useEffect(() => { fetch(); }, [fetch]);

  const pages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <h2 style={{ fontWeight: 600 }}>Activity Log</h2>
        <select value={filterAction} onChange={(e) => { setFilterAction(e.target.value); setPage(1); }} style={{ padding: "6px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)", fontSize: 13 }}>
          <option value="">All actions</option>
          <option value="created">Created</option>
          <option value="completed">Completed</option>
          <option value="deleted">Deleted</option>
          <option value="restored">Restored</option>
          <option value="updated">Updated</option>
        </select>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {entries.map(e => (
          <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 4px", fontSize: 13 }}>
            <span style={{
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 11,
              background: "var(--bg-muted)",
              color: e.action === "completed" ? "var(--green)" : e.action === "deleted" ? "var(--red)" : e.action === "restored" ? "var(--green)" : "var(--text-dim)",
            }}>
              {e.action}
            </span>
            {e.task_id && <span style={{ color: "var(--text-dim)" }}>Task #{e.task_id}</span>}
            <span style={{ color: "var(--text-dim)", marginLeft: "auto", fontSize: 12 }}>{new Date(e.timestamp).toLocaleString()}</span>
          </div>
        ))}
        {entries.length === 0 && <div style={{ color: "var(--text-faint)", padding: 24, textAlign: "center" }}>No activity yet</div>}
      </div>
      {pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16, fontSize: 13 }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn btn-ghost">Prev</button>
          <span style={{ color: "var(--text-dim)", padding: "6px 0" }}>{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="btn btn-ghost">Next</button>
        </div>
      )}
    </div>
  );
}
