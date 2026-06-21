import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { api } from "../api/client";
export default function TaskDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState({});
    const [noteText, setNoteText] = useState("");
    const [newTag, setNewTag] = useState("");
    useEffect(() => {
        if (!id)
            return;
        setLoading(true);
        api.tasks.get(Number(id)).then(setTask).catch(console.error).finally(() => setLoading(false));
    }, [id]);
    if (loading)
        return _jsx("div", { children: "Loading..." });
    if (!task)
        return _jsx("div", { children: "Task not found" });
    const update = async (data) => {
        const updated = await api.tasks.update(task.id, data);
        setTask(updated);
        setEditing({});
    };
    const addTag = async () => {
        if (!newTag.trim())
            return;
        await update({ tags: [...task.tags, newTag.trim()] });
        setNewTag("");
    };
    const removeTag = async (tag) => {
        await update({ tags: task.tags.filter(t => t !== tag) });
    };
    const addNote = async () => {
        if (!noteText.trim())
            return;
        await api.tasks.addNote(task.id, noteText.trim());
        const refreshed = await api.tasks.get(task.id);
        setTask(refreshed);
        setNoteText("");
    };
    const softDelete = async () => {
        await api.tasks.delete(task.id);
        navigate("/tasks");
    };
    return (_jsxs("div", { style: { maxWidth: 640 }, children: [_jsxs("button", { onClick: () => navigate(-1), className: "btn btn-ghost", style: { marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }, children: [_jsx(ArrowLeft, { size: 16 }), " Back"] }), editing.title !== undefined ? (_jsx("input", { autoFocus: true, defaultValue: task.title, onBlur: (e) => update({ title: e.target.value }), onKeyDown: (e) => e.key === "Enter" && update({ title: e.target.value }), style: { fontSize: 20, fontWeight: 600, width: "100%", padding: "4px 8px", background: "var(--bg-raised)", border: "1px solid var(--accent)", borderRadius: 4, outline: "none" } })) : (_jsx("h1", { onClick: () => setEditing({ title: task.title }), style: { fontSize: 20, fontWeight: 600, cursor: "pointer", marginBottom: 16 }, children: task.title })), _jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }, children: [_jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [_jsx("span", { style: { width: 100, fontSize: 13, color: "var(--text-dim)" }, children: "Status" }), _jsx("input", { type: "checkbox", checked: task.status === "done", onChange: async () => {
                                    if (task.status === "done")
                                        await api.tasks.undone(task.id);
                                    else
                                        await api.tasks.done(task.id);
                                    const refreshed = await api.tasks.get(task.id);
                                    setTask(refreshed);
                                }, style: { accentColor: "var(--accent)" } }), _jsx("span", { style: { fontSize: 13, color: "var(--text-dim)" }, children: task.status })] }), _jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [_jsx("span", { style: { width: 100, fontSize: 13, color: "var(--text-dim)" }, children: "Priority" }), _jsxs("select", { value: task.priority, onChange: (e) => update({ priority: e.target.value }), style: { padding: "4px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)" }, children: [_jsx("option", { value: "low", children: "Low" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "high", children: "High" })] })] }), _jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [_jsx("span", { style: { width: 100, fontSize: 13, color: "var(--text-dim)" }, children: "Due date" }), _jsx("input", { type: "text", defaultValue: task.due_date || "", placeholder: "YYYY-MM-DD or relative...", onBlur: (e) => e.target.value !== (task.due_date || "") && update({ due_date: e.target.value }), onKeyDown: (e) => e.key === "Enter" && update({ due_date: e.target.value }), style: { padding: "4px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)", flex: 1 } })] }), _jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [_jsx("span", { style: { width: 100, fontSize: 13, color: "var(--text-dim)" }, children: "Category" }), _jsx("input", { type: "text", defaultValue: task.category, onBlur: (e) => e.target.value !== task.category && update({ category: e.target.value }), onKeyDown: (e) => e.key === "Enter" && update({ category: e.target.value }), style: { padding: "4px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)", flex: 1 } })] }), _jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [_jsx("span", { style: { width: 100, fontSize: 13, color: "var(--text-dim)" }, children: "Recur" }), _jsxs("select", { value: task.recur || "", onChange: (e) => update({ recur: e.target.value || null }), style: { padding: "4px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)" }, children: [_jsx("option", { value: "", children: "None" }), _jsx("option", { value: "daily", children: "Daily" }), _jsx("option", { value: "weekly", children: "Weekly" }), _jsx("option", { value: "monthly", children: "Monthly" })] })] }), _jsxs("div", { children: [_jsx("span", { style: { width: 100, fontSize: 13, color: "var(--text-dim)", display: "inline-block", marginBottom: 4 }, children: "Tags" }), _jsx("div", { style: { display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }, children: task.tags.map(t => (_jsxs("span", { style: { display: "flex", alignItems: "center", gap: 4, fontSize: 12, padding: "2px 8px", background: "var(--bg-muted)", borderRadius: 10 }, children: [t, _jsx("button", { onClick: () => removeTag(t), style: { color: "var(--text-dim)", fontSize: 14, lineHeight: 1 }, children: "\u00D7" })] }, t))) }), _jsxs("div", { style: { display: "flex", gap: 4 }, children: [_jsx("input", { value: newTag, onChange: (e) => setNewTag(e.target.value), onKeyDown: (e) => e.key === "Enter" && addTag(), placeholder: "Add tag...", style: { padding: "4px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)", flex: 1, fontSize: 13 } }), _jsx("button", { onClick: addTag, className: "btn btn-ghost", children: _jsx(Plus, { size: 14 }) })] })] }), _jsxs("div", { children: [_jsx("span", { style: { width: 100, fontSize: 13, color: "var(--text-dim)", display: "block", marginBottom: 4 }, children: "Description" }), _jsx("textarea", { defaultValue: task.description, rows: 3, onBlur: (e) => e.target.value !== task.description && update({ description: e.target.value }), style: { width: "100%", padding: "6px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)", resize: "vertical" } })] })] }), _jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h3", { style: { fontSize: 13, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }, children: "Dependencies" }), task.depends_on.length > 0 ? (_jsx("div", { style: { display: "flex", flexDirection: "column", gap: 4 }, children: task.depends_on.map(d => (_jsx("div", { style: { fontSize: 13 }, children: _jsx("a", { href: `/tasks/${d.id}`, style: { color: "var(--accent)" }, children: d.title }) }, d.id))) })) : (_jsx("div", { style: { fontSize: 13, color: "var(--text-faint)" }, children: "No dependencies" }))] }), _jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h3", { style: { fontSize: 13, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }, children: "Annotations" }), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }, children: task.notes.map(n => (_jsxs("div", { style: { fontSize: 13, padding: "8px", background: "var(--bg-raised)", borderRadius: 4 }, children: [_jsx("div", { children: n.text }), _jsx("div", { style: { fontSize: 11, color: "var(--text-dim)", marginTop: 4 }, children: new Date(n.timestamp).toLocaleString() })] }, n.id))) }), _jsxs("div", { style: { display: "flex", gap: 4 }, children: [_jsx("input", { value: noteText, onChange: (e) => setNoteText(e.target.value), onKeyDown: (e) => e.key === "Enter" && addNote(), placeholder: "Add annotation...", style: { flex: 1, padding: "6px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)", fontSize: 13 } }), _jsx("button", { onClick: addNote, className: "btn btn-ghost", children: _jsx(Plus, { size: 14 }) })] })] }), _jsxs("div", { style: { display: "flex", gap: 8, fontSize: 12, color: "var(--text-dim)", marginBottom: 24 }, children: [_jsxs("span", { children: ["Created: ", new Date(task.created_at).toLocaleString()] }), _jsx("span", { children: "\u00B7" }), _jsxs("span", { children: ["Updated: ", new Date(task.updated_at).toLocaleString()] })] }), _jsx("button", { onClick: softDelete, className: "btn btn-danger", style: { display: "flex", alignItems: "center", gap: 6 }, children: "Delete task" })] }));
}
