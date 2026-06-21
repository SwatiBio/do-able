import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
export default function ActivityLog() {
    const [entries, setEntries] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [filterAction, setFilterAction] = useState("");
    const perPage = 50;
    const fetch = useCallback(async () => {
        try {
            const params = { page: String(page), per_page: String(perPage) };
            if (filterAction)
                params.action = filterAction;
            const res = await api.activity.list(params);
            setEntries(res.entries);
            setTotal(res.total);
        }
        catch { }
    }, [page, filterAction]);
    useEffect(() => { fetch(); }, [fetch]);
    const pages = Math.max(1, Math.ceil(total / perPage));
    return (_jsxs("div", { children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }, children: [_jsx("h2", { style: { fontWeight: 600 }, children: "Activity Log" }), _jsxs("select", { value: filterAction, onChange: (e) => { setFilterAction(e.target.value); setPage(1); }, style: { padding: "6px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)", fontSize: 13 }, children: [_jsx("option", { value: "", children: "All actions" }), _jsx("option", { value: "created", children: "Created" }), _jsx("option", { value: "completed", children: "Completed" }), _jsx("option", { value: "deleted", children: "Deleted" }), _jsx("option", { value: "restored", children: "Restored" }), _jsx("option", { value: "updated", children: "Updated" })] })] }), _jsxs("div", { style: { display: "flex", flexDirection: "column" }, children: [entries.map(e => (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12, padding: "6px 4px", fontSize: 13 }, children: [_jsx("span", { style: {
                                    padding: "2px 8px",
                                    borderRadius: 4,
                                    fontSize: 11,
                                    background: "var(--bg-muted)",
                                    color: e.action === "completed" ? "var(--green)" : e.action === "deleted" ? "var(--red)" : e.action === "restored" ? "var(--green)" : "var(--text-dim)",
                                }, children: e.action }), e.task_id && _jsxs("span", { style: { color: "var(--text-dim)" }, children: ["Task #", e.task_id] }), _jsx("span", { style: { color: "var(--text-dim)", marginLeft: "auto", fontSize: 12 }, children: new Date(e.timestamp).toLocaleString() })] }, e.id))), entries.length === 0 && _jsx("div", { style: { color: "var(--text-faint)", padding: 24, textAlign: "center" }, children: "No activity yet" })] }), pages > 1 && (_jsxs("div", { style: { display: "flex", justifyContent: "center", gap: 8, marginTop: 16, fontSize: 13 }, children: [_jsx("button", { disabled: page <= 1, onClick: () => setPage(p => p - 1), className: "btn btn-ghost", children: "Prev" }), _jsxs("span", { style: { color: "var(--text-dim)", padding: "6px 0" }, children: [page, " / ", pages] }), _jsx("button", { disabled: page >= pages, onClick: () => setPage(p => p + 1), className: "btn btn-ghost", children: "Next" })] }))] }));
}
