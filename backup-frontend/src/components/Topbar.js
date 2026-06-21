import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Moon, Search, Settings, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function Topbar({ searchQuery, onSearchChange, theme, onThemeToggle }) {
    const navigate = useNavigate();
    return (_jsxs("header", { style: {
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "12px 24px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg)",
        }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 16 }, children: [_jsx("span", { style: { color: "var(--accent)" }, children: "\u2611" }), _jsx("span", { children: "Do-able" })] }), _jsxs("div", { style: { flex: 1, maxWidth: 400, position: "relative" }, children: [_jsx(Search, { size: 16, style: { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" } }), _jsx("input", { type: "text", placeholder: "Search tasks...", value: searchQuery, onChange: (e) => onSearchChange(e.target.value), onKeyDown: (e) => {
                            if (e.key === "Enter" && searchQuery.trim()) {
                                navigate(`/tasks?search=${encodeURIComponent(searchQuery.trim())}`);
                            }
                        }, style: {
                            width: "100%",
                            padding: "8px 12px 8px 34px",
                            borderRadius: 6,
                            border: "1px solid var(--border)",
                            background: "var(--bg-raised)",
                            outline: "none",
                        } })] }), _jsx("button", { onClick: onThemeToggle, className: "btn btn-ghost", title: "Toggle theme", children: theme === "nord-dark" ? _jsx(Sun, { size: 18 }) : _jsx(Moon, { size: 18 }) }), _jsx("button", { className: "btn btn-ghost", onClick: () => navigate("/settings"), title: "Settings", children: _jsx(Settings, { size: 18 }) })] }));
}
