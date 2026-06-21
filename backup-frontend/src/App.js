import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import TaskList from "./pages/TaskList";
import TaskDetail from "./pages/TaskDetail";
import Focus from "./pages/Focus";
import Bin from "./pages/Bin";
import ActivityLog from "./pages/ActivityLog";
import Settings from "./pages/Settings";
function detectTheme() {
    const saved = localStorage.getItem("todo-theme");
    if (saved)
        return saved;
    if (window.matchMedia("(prefers-color-scheme: dark)").matches)
        return "nord-dark";
    return "nord-light";
}
export default function App() {
    const [theme, setTheme] = useState(detectTheme);
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);
    return (_jsx(Layout, { theme: theme, onThemeToggle: () => setTheme(t => t === "nord-dark" ? "nord-light" : "nord-dark"), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/tasks", element: _jsx(TaskList, {}) }), _jsx(Route, { path: "/tasks/:id", element: _jsx(TaskDetail, {}) }), _jsx(Route, { path: "/focus", element: _jsx(Focus, {}) }), _jsx(Route, { path: "/bin", element: _jsx(Bin, {}) }), _jsx(Route, { path: "/log", element: _jsx(ActivityLog, {}) }), _jsx(Route, { path: "/settings", element: _jsx(Settings, {}) })] }) }));
}
