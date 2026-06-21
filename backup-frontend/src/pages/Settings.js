import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { useConfig } from "../hooks/useConfig";
export default function Settings() {
    const { config, update } = useConfig();
    const [backups, setBackups] = useState([]);
    const [saving, setSaving] = useState(false);
    const loadBackups = useCallback(async () => {
        try {
            const res = await api.backup.list();
            setBackups(res.backups);
        }
        catch { }
    }, []);
    useEffect(() => { loadBackups(); }, [loadBackups]);
    const themeChange = async (theme) => {
        setSaving(true);
        await update({ theme });
        loadBackups();
        setSaving(false);
    };
    const createBackup = async () => {
        await api.backup.create();
        loadBackups();
    };
    const restoreBackup = async (filename) => {
        if (!confirm(`Restore from ${filename}? Current data will be replaced.`))
            return;
        await api.backup.restore(filename);
        alert("Backup restored. Reload to see changes.");
    };
    if (!config)
        return _jsx("div", { children: "Loading..." });
    return (_jsxs("div", { style: { maxWidth: 480 }, children: [_jsx("h2", { style: { fontWeight: 600, marginBottom: 24 }, children: "Settings" }), _jsxs("section", { style: { marginBottom: 24 }, children: [_jsx("h3", { style: { fontSize: 13, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }, children: "Theme" }), _jsx("div", { style: { display: "flex", gap: 8 }, children: ["nord-dark", "nord-light", "auto"].map(t => (_jsx("button", { onClick: () => {
                                themeChange(t);
                                if (t === "auto") {
                                    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                                    document.documentElement.setAttribute("data-theme", prefersDark ? "nord-dark" : "nord-light");
                                    localStorage.removeItem("todo-theme");
                                }
                                else {
                                    document.documentElement.setAttribute("data-theme", t);
                                    localStorage.setItem("todo-theme", t);
                                }
                            }, className: `btn ${config.theme === t ? "btn-primary" : "btn-ghost"}`, children: t === "nord-dark" ? "Dark" : t === "nord-light" ? "Light" : "Auto" }, t))) })] }), _jsxs("section", { style: { marginBottom: 24 }, children: [_jsx("h3", { style: { fontSize: 13, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }, children: "Date Mode" }), _jsx("div", { style: { display: "flex", gap: 8 }, children: ["iso", "smart"].map(m => (_jsx("button", { onClick: () => update({ date_mode: m }), className: `btn ${config.date_mode === m ? "btn-primary" : "btn-ghost"}`, children: m === "iso" ? "ISO (2026-06-25)" : "Smart (in 3 days)" }, m))) })] }), _jsxs("section", { style: { marginBottom: 24 }, children: [_jsx("h3", { style: { fontSize: 13, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }, children: "Notifications" }), _jsxs("label", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [_jsx("input", { type: "checkbox", checked: config.notifications, onChange: (e) => update({ notifications: e.target.checked }), style: { accentColor: "var(--accent)" } }), _jsx("span", { children: "Show overdue alerts" })] })] }), _jsxs("section", { style: { marginBottom: 24 }, children: [_jsx("h3", { style: { fontSize: 13, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }, children: "Pagination Size" }), _jsx("input", { type: "number", value: config.per_page, min: 10, max: 100, onChange: (e) => update({ per_page: Number(e.target.value) }), style: { padding: "6px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)", width: 80 } })] }), _jsxs("section", { style: { marginBottom: 24 }, children: [_jsx("h3", { style: { fontSize: 13, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }, children: "Backup & Restore" }), _jsx("button", { onClick: createBackup, className: "btn btn-primary", style: { marginBottom: 8 }, children: "Create backup" }), backups.length > 0 && (_jsx("div", { style: { display: "flex", flexDirection: "column", gap: 4 }, children: backups.map(b => (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "6px 0" }, children: [_jsx("span", { style: { flex: 1, color: "var(--text-dim)" }, children: b.filename }), _jsx("button", { onClick: () => restoreBackup(b.filename), className: "btn btn-ghost", style: { fontSize: 12, color: "var(--orange)" }, children: "Restore" })] }, b.filename))) }))] }), _jsxs("section", { style: { marginBottom: 24 }, children: [_jsx("h3", { style: { fontSize: 13, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }, children: "Export" }), _jsxs("div", { style: { display: "flex", gap: 8 }, children: [_jsx("button", { onClick: () => api.export.download("json"), className: "btn btn-ghost", children: "JSON" }), _jsx("button", { onClick: () => api.export.download("csv"), className: "btn btn-ghost", children: "CSV" }), _jsx("button", { onClick: () => api.export.download("md"), className: "btn btn-ghost", children: "Markdown" })] })] }), _jsxs("section", { children: [_jsx("h3", { style: { fontSize: 13, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }, children: "Data Location" }), _jsx("code", { style: { fontSize: 12, color: "var(--text-dim)", background: "var(--bg-raised)", padding: "4px 8px", borderRadius: 4 }, children: "~/.todo/todo.db" })] })] }));
}
