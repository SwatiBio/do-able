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

function detectTheme(): string {
  const saved = localStorage.getItem("todo-theme");
  if (saved) return saved;
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "nord-dark";
  return "nord-light";
}

export default function App() {
  const [theme, setTheme] = useState(detectTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <Layout theme={theme} onThemeToggle={() => setTheme(t => t === "nord-dark" ? "nord-light" : "nord-dark")}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/tasks/:id" element={<TaskDetail />} />
        <Route path="/focus" element={<Focus />} />
        <Route path="/bin" element={<Bin />} />
        <Route path="/log" element={<ActivityLog />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}
