import { NavLink } from "react-router-dom";
import {
  History,
  LayoutDashboard,
  ListTodo,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Trash2,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/tasks", icon: ListTodo, label: "Tasks" },
  { to: "/bin", icon: Trash2, label: "Bin" },
  { to: "/log", icon: History, label: "Log" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar({ open, onToggle }: SidebarProps) {
  return (
    <nav
      style={{
        width: open ? 220 : 56,
        background: "var(--bg-muted)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s",
        overflow: "hidden",
        borderRight: "1px solid var(--border)",
      }}
    >
      <div style={{ flex: 1, padding: "12px 0" }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={item.label}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 16px",
              color: isActive ? "var(--accent)" : "var(--text-dim)",
              borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
              textDecoration: "none",
              whiteSpace: "nowrap",
              fontSize: 14,
            })}
          >
            <item.icon size={20} />
            {open && <span>{item.label}</span>}
          </NavLink>
        ))}
      </div>
      <button
        onClick={onToggle}
        style={{
          padding: "12px 16px",
          color: "var(--text-dim)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderTop: "1px solid var(--border)",
        }}
      >
        {open ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        {open && <span>Collapse</span>}
      </button>
    </nav>
  );
}
