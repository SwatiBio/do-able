import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from "react-router-dom";
import { History, LayoutDashboard, ListTodo, PanelLeftClose, PanelLeftOpen, Settings, Trash2, } from "lucide-react";
const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/tasks", icon: ListTodo, label: "Tasks" },
    { to: "/bin", icon: Trash2, label: "Bin" },
    { to: "/log", icon: History, label: "Log" },
    { to: "/settings", icon: Settings, label: "Settings" },
];
export default function Sidebar({ open, onToggle }) {
    return (_jsxs("nav", { style: {
            width: open ? 220 : 56,
            background: "var(--bg-muted)",
            display: "flex",
            flexDirection: "column",
            transition: "width 0.2s",
            overflow: "hidden",
            borderRight: "1px solid var(--border)",
        }, children: [_jsx("div", { style: { flex: 1, padding: "12px 0" }, children: navItems.map((item) => (_jsxs(NavLink, { to: item.to, title: item.label, style: ({ isActive }) => ({
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 16px",
                        color: isActive ? "var(--accent)" : "var(--text-dim)",
                        borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                        fontSize: 14,
                    }), children: [_jsx(item.icon, { size: 20 }), open && _jsx("span", { children: item.label })] }, item.to))) }), _jsxs("button", { onClick: onToggle, style: {
                    padding: "12px 16px",
                    color: "var(--text-dim)",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    borderTop: "1px solid var(--border)",
                }, children: [open ? _jsx(PanelLeftClose, { size: 20 }) : _jsx(PanelLeftOpen, { size: 20 }), open && _jsx("span", { children: "Collapse" })] })] }));
}
