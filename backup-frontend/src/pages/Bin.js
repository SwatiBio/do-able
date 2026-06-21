import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
export default function Bin() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.bin.list();
            setTasks(res.tasks || []);
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { fetch(); }, [fetch]);
    const restore = async (id) => {
        await api.bin.restore(id);
        fetch();
    };
    const empty = async () => {
        if (!confirm("Permanently delete all binned tasks?"))
            return;
        await api.bin.empty();
        fetch();
    };
    if (loading)
        return _jsx("div", { children: "Loading..." });
    return (_jsxs("div", { children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }, children: [_jsx("h2", { style: { fontWeight: 600 }, children: "Bin" }), tasks.length > 0 && (_jsx("button", { onClick: empty, className: "btn btn-danger", children: "Empty bin" }))] }), tasks.length === 0 ? (_jsx("div", { style: { color: "var(--text-faint)", padding: 24, textAlign: "center" }, children: "Bin is empty" })) : (_jsx("div", { children: tasks.map(task => (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12, padding: "8px 4px" }, children: [_jsx("span", { style: { flex: 1, color: "var(--text-dim)", textDecoration: "line-through" }, children: task.title }), _jsx("span", { style: { fontSize: 12, color: "var(--text-dim)" }, children: task.status }), _jsx("button", { onClick: () => restore(task.id), className: "btn btn-ghost", style: { fontSize: 12, color: "var(--green)" }, children: "Restore" })] }, task.id))) }))] }));
}
