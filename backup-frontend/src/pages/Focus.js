import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
export default function Focus() {
    const [goals, setGoals] = useState([]);
    const [goalIds, setGoalIds] = useState([]);
    const [search, setSearch] = useState("");
    const [candidates, setCandidates] = useState([]);
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
            setGoals(results.filter((t) => t !== null));
        }
        catch { }
    }, []);
    useEffect(() => { loadGoals(); }, [loadGoals]);
    useEffect(() => {
        if (!search.trim()) {
            setCandidates([]);
            return;
        }
        api.tasks.search(search).then(res => setCandidates(res.tasks?.filter(t => t.status !== "done" && !goalIds.includes(t.id)) || [])).catch(() => { });
    }, [search, goalIds]);
    const addGoal = async (taskId) => {
        const newIds = [...goalIds, taskId];
        await api.focus.set(newIds);
        setGoalIds(newIds);
        setSearch("");
        setShowSelector(false);
        loadGoals();
    };
    const removeGoal = async (taskId) => {
        const newIds = goalIds.filter(id => id !== taskId);
        await api.focus.set(newIds);
        setGoalIds(newIds);
        loadGoals();
    };
    const toggleDone = async (task) => {
        if (task.status === "done") {
            await api.tasks.undone(task.id);
        }
        else {
            await api.tasks.done(task.id);
        }
        loadGoals();
    };
    const doneCount = goals.filter(g => g.status === "done").length;
    const allDone = goals.length > 0 && doneCount === goals.length;
    return (_jsxs("div", { style: { maxWidth: 480, margin: "0 auto" }, children: [_jsxs("div", { style: { textAlign: "center", marginBottom: 32 }, children: [_jsx("h2", { style: { fontWeight: 600, marginBottom: 8 }, children: "Focus" }), _jsxs("div", { style: { fontSize: 24, fontWeight: 700, color: "var(--accent)" }, children: [doneCount, " of ", goals.length, " done"] })] }), allDone && (_jsx("div", { style: { textAlign: "center", fontSize: 48, marginBottom: 24 }, children: "\uD83C\uDF89" })), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }, children: goals.map((goal) => (_jsxs("div", { style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "16px",
                        background: "var(--bg-raised)",
                        borderRadius: 8,
                        border: goal.status === "done" ? "1px solid var(--green)" : "1px solid transparent",
                    }, children: [_jsx("input", { type: "checkbox", checked: goal.status === "done", onChange: () => toggleDone(goal), style: { width: 20, height: 20, accentColor: "var(--green)" } }), _jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { style: { fontWeight: 500, textDecoration: goal.status === "done" ? "line-through" : "none", opacity: goal.status === "done" ? 0.6 : 1 }, children: [_jsx("span", { className: `priority-${goal.priority}`, style: { marginRight: 6 }, children: "\u25CF" }), goal.title] }), goal.due_date && _jsx("div", { style: { fontSize: 12, color: "var(--text-dim)" }, children: goal.due_date })] }), _jsx("button", { onClick: () => removeGoal(goal.id), className: "btn btn-ghost", style: { color: "var(--red)", fontSize: 12 }, children: "Remove" })] }, goal.id))) }), goals.length < 3 && !showSelector && (_jsx("button", { onClick: () => setShowSelector(true), className: "btn btn-primary", style: { width: "100%" }, children: "Add goal" })), showSelector && (_jsxs("div", { children: [_jsx("input", { autoFocus: true, value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search tasks to add as goal...", style: { width: "100%", padding: "8px 12px", borderRadius: 4, border: "1px solid var(--accent)", background: "var(--bg-raised)", marginBottom: 8 } }), candidates.map(c => (_jsx("div", { onClick: () => addGoal(c.id), style: { padding: "8px 12px", cursor: "pointer", borderRadius: 4, background: "var(--bg-raised)", marginBottom: 4, fontSize: 13 }, children: c.title }, c.id))), search.trim() && candidates.length === 0 && (_jsx("div", { style: { fontSize: 13, color: "var(--text-dim)" }, children: "No matching tasks" }))] }))] }));
}
