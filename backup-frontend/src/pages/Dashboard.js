import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pin, PinOff, Target, Trash2 } from "lucide-react";
import { api } from "../api/client";
import { useStats } from "../hooks/useStats";
export default function Dashboard() {
    const { data } = useStats();
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState("");
    const [morningOpen, setMorningOpen] = useState(true);
    const loadNotes = async () => {
        try {
            const res = await api.notes.list();
            setNotes(res.notes);
        }
        catch { }
    };
    useState(() => { loadNotes(); });
    const addNote = async () => {
        if (!newNote.trim())
            return;
        await api.notes.create(newNote.trim());
        setNewNote("");
        loadNotes();
    };
    const togglePin = async (note) => {
        await api.notes.update(note.id, { pinned: !note.pinned });
        loadNotes();
    };
    const deleteNote = async (id) => {
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
    return (_jsxs("div", { children: [_jsxs("div", { style: {
                    borderTop: "2px solid var(--accent)",
                    padding: "16px 0",
                    marginBottom: 24,
                }, children: [_jsxs("button", { onClick: () => setMorningOpen(!morningOpen), style: { fontWeight: 600, fontSize: 15, color: "var(--accent)", marginBottom: 12, display: "block" }, children: [morningOpen ? "▼" : "▶", " Morning"] }), morningOpen && (_jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [_jsx("div", { children: _jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, color: "var(--text-dim)", marginBottom: 8 }, children: [_jsx(Target, { size: 16 }), _jsx("span", { children: "Focus Goals" }), _jsx(Link, { to: "/focus", style: { fontSize: 12 }, children: "Manage" })] }) }), _jsxs("div", { children: [_jsx("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: notes.map((n) => (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", background: "var(--bg-raised)", borderRadius: 4 }, children: [_jsx("button", { onClick: () => togglePin(n), className: "btn btn-ghost", style: { padding: 2 }, children: n.pinned ? _jsx(PinOff, { size: 14 }) : _jsx(Pin, { size: 14 }) }), _jsx("span", { style: { flex: 1 }, children: n.text }), _jsx("button", { onClick: () => deleteNote(n.id), className: "btn btn-ghost", style: { padding: 2, color: "var(--red)" }, children: _jsx(Trash2, { size: 14 }) })] }, n.id))) }), _jsxs("div", { style: { display: "flex", gap: 8, marginTop: 8 }, children: [_jsx("input", { value: newNote, onChange: (e) => setNewNote(e.target.value), onKeyDown: (e) => e.key === "Enter" && addNote(), placeholder: "Add a scratch note...", style: { flex: 1, padding: "6px 10px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)" } }), _jsx("button", { onClick: addNote, className: "btn btn-primary", children: _jsx(Plus, { size: 16 }) })] })] }), _jsxs("div", { style: { fontStyle: "italic", color: "var(--text-dim)", fontSize: 13, padding: "8px 0" }, children: ["\"", quote, "\""] })] }))] }), _jsxs("div", { style: { display: "flex", gap: 24, marginBottom: 24 }, children: [_jsxs("div", { children: [_jsx("span", { style: { color: "var(--red)", fontWeight: 600 }, children: data?.overdue ?? 0 }), _jsx("span", { style: { color: "var(--text-dim)", marginLeft: 6, fontSize: 13 }, children: "overdue" })] }), _jsxs("div", { children: [_jsx("span", { style: { color: "var(--yellow)", fontWeight: 600 }, children: data?.due_today ?? 0 }), _jsx("span", { style: { color: "var(--text-dim)", marginLeft: 6, fontSize: 13 }, children: "due today" })] })] }), data && (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 16, marginBottom: 24, fontSize: 13, color: "var(--text-dim)", flexWrap: "wrap" }, children: [_jsxs("span", { children: ["Total: ", _jsx("strong", { style: { color: "var(--text)" }, children: data.counts.total })] }), _jsxs("span", { children: ["Active: ", _jsx("strong", { style: { color: "var(--text)" }, children: (data.counts.not_started || 0) + (data.counts.started || 0) })] }), _jsxs("span", { children: ["Done: ", _jsx("strong", { style: { color: "var(--text)" }, children: data.counts.done })] }), data.task_count_by_day && data.task_count_by_day.length > 1 && (_jsx(Sparkline, { data: data.task_count_by_day }))] })), _jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h3", { style: { fontWeight: 600, fontSize: 13, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }, children: "Analytics" }), data && (_jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: 13, color: "var(--text-dim)", marginBottom: 6 }, children: "By Priority" }), ["high", "medium", "low"].map((p) => (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }, children: [_jsx("span", { style: { width: 50, fontSize: 12, color: `var(--${p === "high" ? "red" : p === "medium" ? "orange" : "accent"})` }, children: p }), _jsx("div", { style: { flex: 1, height: 12, background: "var(--bg-raised)", borderRadius: 2 }, children: _jsx("div", { style: { width: `${((data.by_priority[p] || 0) / Math.max(...Object.values(data.by_priority), 1)) * 100}%`, height: "100%", background: `var(--${p === "high" ? "red" : p === "medium" ? "orange" : "accent"})`, borderRadius: 2 } }) }), _jsx("span", { style: { fontSize: 12, color: "var(--text-dim)", width: 30, textAlign: "right" }, children: data.by_priority[p] || 0 })] }, p)))] }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: 13, color: "var(--text-dim)", marginBottom: 6 }, children: "By Category" }), Object.entries(data.by_category).map(([cat, count]) => (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }, children: [_jsx("span", { style: { width: 60, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis" }, children: cat }), _jsx("div", { style: { flex: 1, height: 12, background: "var(--bg-raised)", borderRadius: 2 }, children: _jsx("div", { style: { width: `${(count / Math.max(...Object.values(data.by_category), 1)) * 100}%`, height: "100%", background: "var(--accent)", borderRadius: 2 } }) }), _jsx("span", { style: { fontSize: 12, color: "var(--text-dim)", width: 30, textAlign: "right" }, children: count })] }, cat))), Object.keys(data.by_category).length === 0 && _jsx("span", { style: { fontSize: 12, color: "var(--text-faint)" }, children: "No categories" })] })] })), data && (_jsxs("div", { style: { marginTop: 16, fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7 }, children: [_jsx("p", { children: data.weekly_recap }), _jsx("p", { children: data.monthly_recap })] }))] }), _jsxs("div", { children: [_jsx("h3", { style: { fontWeight: 600, fontSize: 13, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }, children: "Recent Activity" }), data?.recent_activity.length ? (_jsx("div", { style: { display: "flex", flexDirection: "column", gap: 4 }, children: data.recent_activity.map((a, i) => (_jsxs("div", { style: { fontSize: 13, color: "var(--text-dim)" }, children: [_jsx("span", { style: { color: "var(--text)" }, children: a.action }), _jsx("span", { style: { marginLeft: 6 }, children: new Date(a.timestamp).toLocaleString() })] }, i))) })) : (_jsx("div", { style: { fontSize: 13, color: "var(--text-faint)" }, children: "No recent activity" }))] })] }));
}
function Sparkline({ data }) {
    if (data.length < 2)
        return null;
    const values = data.map(d => d.count);
    const max = Math.max(...values, 1);
    const w = 120, h = 24;
    const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (v / max) * h}`).join(" ");
    return (_jsxs("svg", { width: w, height: h, style: { display: "block" }, "aria-label": "Task completion sparkline", children: [_jsx("polyline", { points: pts, fill: "none", stroke: "var(--accent)", strokeWidth: 1.5, vectorEffect: "non-scaling-stroke" }), _jsx("circle", { cx: w, cy: h - (values[values.length - 1] / max) * h, r: 2, fill: "var(--accent)", vectorEffect: "non-scaling-stroke" })] }));
}
