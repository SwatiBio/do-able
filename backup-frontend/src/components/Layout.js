import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
export default function Layout({ children, theme, onThemeToggle }) {
    const location = useLocation();
    const isFocus = location.pathname.startsWith("/focus");
    const [sidebarOpen, setSidebarOpen] = useState(!isFocus);
    const [searchQuery, setSearchQuery] = useState("");
    return (_jsxs("div", { style: { display: "flex", height: "100vh", overflow: "hidden" }, children: [_jsx(Sidebar, { open: sidebarOpen, onToggle: () => setSidebarOpen(!sidebarOpen) }), _jsxs("div", { style: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }, children: [_jsx(Topbar, { searchQuery: searchQuery, onSearchChange: setSearchQuery, theme: theme, onThemeToggle: onThemeToggle }), _jsx("main", { style: { flex: 1, padding: "24px", overflow: "auto" }, children: children })] })] }));
}
