import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Calendar, Kanban, LayoutList, Plus } from "lucide-react";
import { api } from "../api/client";
import { useDebounce } from "../hooks/useDebounce";
export default function TaskList() {
    const [params] = useSearchParams();
    const [view, setView] = useState("list");
    const [tasks, setTasks] = useState([]);
    const [sections, setSections] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [perPage] = useState(25);
    const [loading, setLoading] = useState(true);
    const [newTitle, setNewTitle] = useState("");
    const [newPriority, setNewPriority] = useState("medium");
    const [search, setSearch] = useState(params.get("search") || "");
    const debouncedSearch = useDebounce(search, 200);
    const [filterStatus, setFilterStatus] = useState("");
    const [group, setGroup] = useState(false);
    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const qs = { page: String(page), per_page: String(perPage) };
            if (debouncedSearch)
                qs.search = debouncedSearch;
            if (filterStatus)
                qs.status = filterStatus;
            if (group)
                qs.group = "due";
            const res = await api.tasks.list(qs);
            setTasks(res.tasks || []);
            setSections(res.sections || []);
            setTotal(res.total);
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setLoading(false);
        }
    }, [page, perPage, debouncedSearch, filterStatus, group]);
    useEffect(() => { fetchTasks(); }, [fetchTasks]);
    const addTask = async () => {
        if (!newTitle.trim())
            return;
        await api.tasks.create({ title: newTitle.trim(), priority: newPriority });
        setNewTitle("");
        fetchTasks();
    };
    const cycleStatus = async (task) => {
        const next = { not_started: "started", started: "done", done: "not_started" };
        await api.tasks.update(task.id, { status: next[task.status] || "not_started" });
        fetchTasks();
    };
    const pages = Math.max(1, Math.ceil(total / perPage));
    const renderTaskRow = (task) => (_jsxs("div", { className: task.status === "done" ? "status-done" : "", style: { display: "flex", alignItems: "center", gap: 12, padding: "8px 4px" }, children: [_jsx("input", { type: "checkbox", checked: task.status === "done", onChange: () => cycleStatus(task), style: { accentColor: "var(--accent)" } }), _jsx("span", { className: `priority-${task.priority}`, style: { fontSize: 18, lineHeight: 1 }, children: "\u25CF" }), _jsx(Link, { to: `/tasks/${task.id}`, style: { flex: 1, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: task.title }), task.due_date && (_jsx("span", { className: task.due_date < new Date().toISOString().slice(0, 10) && task.status !== "done" ? "overdue" : "", style: { fontSize: 12, minWidth: 80, textAlign: "right" }, children: task.due_date })), task.tags.length > 0 && (_jsx("div", { style: { display: "flex", gap: 4 }, children: task.tags.slice(0, 3).map((t) => (_jsx("span", { style: { fontSize: 11, padding: "1px 6px", background: "var(--bg-muted)", borderRadius: 10, color: "var(--text-dim)" }, children: t }, t))) }))] }, task.id));
    return (_jsxs("div", { children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }, children: [_jsxs("div", { style: { flex: 1, display: "flex", gap: 8 }, children: [_jsx("input", { value: newTitle, onChange: (e) => setNewTitle(e.target.value), onKeyDown: (e) => e.key === "Enter" && addTask(), placeholder: "Quick add...", style: { flex: 1, padding: "8px 12px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)" } }), _jsxs("select", { value: newPriority, onChange: (e) => setNewPriority(e.target.value), style: { padding: "8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)" }, children: [_jsx("option", { value: "low", children: "Low" }), _jsx("option", { value: "medium", children: "Med" }), _jsx("option", { value: "high", children: "High" })] }), _jsx("button", { onClick: addTask, className: "btn btn-primary", children: _jsx(Plus, { size: 16 }) })] }), _jsxs("div", { style: { display: "flex", gap: 4 }, children: [_jsx("button", { onClick: () => setView("list"), className: `btn btn-ghost ${view === "list" ? "btn-primary" : ""}`, children: _jsx(LayoutList, { size: 18 }) }), _jsx("button", { onClick: () => setView("kanban"), className: `btn btn-ghost ${view === "kanban" ? "btn-primary" : ""}`, children: _jsx(Kanban, { size: 18 }) }), _jsx("button", { onClick: () => setView("calendar"), className: `btn btn-ghost ${view === "calendar" ? "btn-primary" : ""}`, children: _jsx(Calendar, { size: 18 }) })] })] }), _jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 12 }, children: [_jsx("input", { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search...", style: { flex: 1, padding: "6px 10px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)" } }), _jsxs("select", { value: filterStatus, onChange: (e) => setFilterStatus(e.target.value), style: { padding: "6px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)" }, children: [_jsx("option", { value: "", children: "All" }), _jsx("option", { value: "not_started", children: "Not Started" }), _jsx("option", { value: "started", children: "Started" }), _jsx("option", { value: "done", children: "Done" })] }), _jsxs("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-dim)" }, children: [_jsx("input", { type: "checkbox", checked: group, onChange: (e) => setGroup(e.target.checked) }), "Group"] })] }), view === "list" && (_jsxs("div", { children: [loading ? (_jsx("div", { style: { color: "var(--text-dim)" }, children: "Loading..." })) : sections.length > 0 ? (sections.map((sec) => (_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 13, color: "var(--text-dim)", marginBottom: 4 }, children: sec.name }), sec.tasks.map(renderTaskRow)] }, sec.name)))) : tasks.length > 0 ? (tasks.map(renderTaskRow)) : (_jsx("div", { style: { color: "var(--text-faint)", padding: 24, textAlign: "center" }, children: "No tasks yet" })), pages > 1 && (_jsxs("div", { style: { display: "flex", justifyContent: "center", gap: 8, marginTop: 16, fontSize: 13 }, children: [_jsx("button", { disabled: page <= 1, onClick: () => setPage(p => p - 1), className: "btn btn-ghost", children: "Prev" }), _jsxs("span", { style: { color: "var(--text-dim)", padding: "6px 0" }, children: [page, " / ", pages] }), _jsx("button", { disabled: page >= pages, onClick: () => setPage(p => p + 1), className: "btn btn-ghost", children: "Next" })] }))] })), view === "kanban" && (_jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }, children: ["not_started", "started", "done"].map((status) => (_jsxs("div", { style: { background: "var(--bg-raised)", borderRadius: 8, padding: 12 }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 13, color: "var(--text-dim)", textTransform: "capitalize", marginBottom: 8 }, children: status }), tasks.filter(t => t.status === status).map(t => (_jsxs("div", { style: { padding: "8px 10px", background: "var(--bg)", borderRadius: 4, marginBottom: 6 }, children: [_jsxs("div", { style: { display: "flex", gap: 6, alignItems: "center" }, children: [_jsx("span", { className: `priority-${t.priority}`, children: "\u25CF" }), _jsx(Link, { to: `/tasks/${t.id}`, style: { color: "var(--text)" }, children: t.title })] }), t.due_date && _jsx("div", { style: { fontSize: 11, color: "var(--text-dim)", marginTop: 4 }, children: t.due_date }), t.tags.length > 0 && (_jsx("div", { style: { display: "flex", gap: 4, marginTop: 4 }, children: t.tags.map(tag => _jsx("span", { style: { fontSize: 10, padding: "1px 5px", background: "var(--bg-muted)", borderRadius: 8, color: "var(--text-dim)" }, children: tag }, tag)) }))] }, t.id)))] }, status))) })), view === "calendar" && (_jsx(CalendarView, { tasks: tasks }))] }));
}
function CalendarView({ tasks }) {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const tasksByDate = {};
    tasks.forEach(t => {
        if (t.due_date) {
            if (!tasksByDate[t.due_date])
                tasksByDate[t.due_date] = [];
            tasksByDate[t.due_date].push(t);
        }
    });
    const todayStr = now.toISOString().slice(0, 10);
    return (_jsxs("div", { children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }, children: [_jsx("button", { onClick: () => { if (month === 0) {
                            setYear(y => y - 1);
                            setMonth(11);
                        }
                        else
                            setMonth(m => m - 1); }, className: "btn btn-ghost", children: "\u2190" }), _jsxs("span", { style: { fontWeight: 600 }, children: [monthNames[month], " ", year] }), _jsx("button", { onClick: () => { if (month === 11) {
                            setYear(y => y + 1);
                            setMonth(0);
                        }
                        else
                            setMonth(m => m + 1); }, className: "btn btn-ghost", children: "\u2192" }), _jsx("button", { onClick: () => { setYear(now.getFullYear()); setMonth(now.getMonth()); }, className: "btn btn-ghost", style: { fontSize: 12 }, children: "Today" })] }), _jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }, children: [dayNames.map(d => _jsx("div", { style: { padding: 6, fontSize: 11, color: "var(--text-dim)", textAlign: "center" }, children: d }, d)), Array.from({ length: startPad }).map((_, i) => _jsx("div", {}, `pad-${i}`)), Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                        const dayTasks = tasksByDate[dateStr] || [];
                        return (_jsxs("div", { style: {
                                padding: "6px 8px",
                                minHeight: 60,
                                background: dateStr === todayStr ? "var(--bg-raised)" : "transparent",
                                fontSize: 12,
                                borderRadius: 2,
                            }, children: [_jsx("div", { style: { fontWeight: dateStr === todayStr ? 700 : 400 }, children: day }), dayTasks.length > 0 && (_jsxs("div", { style: { marginTop: 4, display: "flex", flexDirection: "column", gap: 2 }, children: [dayTasks.slice(0, 3).map(t => (_jsxs("div", { style: { fontSize: 10, display: "flex", gap: 3, alignItems: "center" }, children: [_jsx("span", { className: `priority-${t.priority}`, children: "\u25CF" }), _jsx("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: t.title })] }, t.id))), dayTasks.length > 3 && _jsxs("span", { style: { fontSize: 10, color: "var(--text-dim)" }, children: ["+", dayTasks.length - 3, " more"] })] }))] }, day));
                    })] })] }));
}
