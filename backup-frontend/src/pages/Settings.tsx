import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { useConfig } from "../hooks/useConfig";
import type { BackupInfo } from "../types";

export default function Settings() {
  const { config, update } = useConfig();
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [saving, setSaving] = useState(false);

  const loadBackups = useCallback(async () => {
    try {
      const res = await api.backup.list();
      setBackups(res.backups);
    } catch {}
  }, []);

  useEffect(() => { loadBackups(); }, [loadBackups]);

  const themeChange = async (theme: string) => {
    setSaving(true);
    await update({ theme });
    loadBackups();
    setSaving(false);
  };

  const createBackup = async () => {
    await api.backup.create();
    loadBackups();
  };

  const restoreBackup = async (filename: string) => {
    if (!confirm(`Restore from ${filename}? Current data will be replaced.`)) return;
    await api.backup.restore(filename);
    alert("Backup restored. Reload to see changes.");
  };

  if (!config) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 style={{ fontWeight: 600, marginBottom: 24 }}>Settings</h2>

      <section style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Theme</h3>
        <div style={{ display: "flex", gap: 8 }}>
          {["nord-dark", "nord-light", "auto"].map(t => (
            <button
              key={t}
              onClick={() => {
                themeChange(t);
                if (t === "auto") {
                  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  document.documentElement.setAttribute("data-theme", prefersDark ? "nord-dark" : "nord-light");
                  localStorage.removeItem("todo-theme");
                } else {
                  document.documentElement.setAttribute("data-theme", t);
                  localStorage.setItem("todo-theme", t);
                }
              }}
              className={`btn ${config.theme === t ? "btn-primary" : "btn-ghost"}`}
            >
              {t === "nord-dark" ? "Dark" : t === "nord-light" ? "Light" : "Auto"}
            </button>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Date Mode</h3>
        <div style={{ display: "flex", gap: 8 }}>
          {["iso", "smart"].map(m => (
            <button
              key={m}
              onClick={() => update({ date_mode: m })}
              className={`btn ${config.date_mode === m ? "btn-primary" : "btn-ghost"}`}
            >
              {m === "iso" ? "ISO (2026-06-25)" : "Smart (in 3 days)"}
            </button>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Notifications</h3>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={config.notifications}
            onChange={(e) => update({ notifications: e.target.checked })}
            style={{ accentColor: "var(--accent)" }}
          />
          <span>Show overdue alerts</span>
        </label>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Pagination Size</h3>
        <input
          type="number"
          value={config.per_page}
          min={10}
          max={100}
          onChange={(e) => update({ per_page: Number(e.target.value) })}
          style={{ padding: "6px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)", width: 80 }}
        />
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Backup & Restore</h3>
        <button onClick={createBackup} className="btn btn-primary" style={{ marginBottom: 8 }}>
          Create backup
        </button>
        {backups.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {backups.map(b => (
              <div key={b.filename} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "6px 0" }}>
                <span style={{ flex: 1, color: "var(--text-dim)" }}>{b.filename}</span>
                <button onClick={() => restoreBackup(b.filename)} className="btn btn-ghost" style={{ fontSize: 12, color: "var(--orange)" }}>Restore</button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Export</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => api.export.download("json")} className="btn btn-ghost">JSON</button>
          <button onClick={() => api.export.download("csv")} className="btn btn-ghost">CSV</button>
          <button onClick={() => api.export.download("md")} className="btn btn-ghost">Markdown</button>
        </div>
      </section>

      <section>
        <h3 style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Data Location</h3>
        <code style={{ fontSize: 12, color: "var(--text-dim)", background: "var(--bg-raised)", padding: "4px 8px", borderRadius: 4 }}>
          ~/.todo/todo.db
        </code>
      </section>
    </div>
  );
}
