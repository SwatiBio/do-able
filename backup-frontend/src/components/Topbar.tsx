import { Moon, Search, Settings, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TopbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  theme: string;
  onThemeToggle: () => void;
}

export default function Topbar({ searchQuery, onSearchChange, theme, onThemeToggle }: TopbarProps) {
  const navigate = useNavigate();

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 24px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 16 }}>
        <span style={{ color: "var(--accent)" }}>☑</span>
        <span>Do-able</span>
      </div>
      <div style={{ flex: 1, maxWidth: 400, position: "relative" }}>
        <Search size={16} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && searchQuery.trim()) {
              navigate(`/tasks?search=${encodeURIComponent(searchQuery.trim())}`);
            }
          }}
          style={{
            width: "100%",
            padding: "8px 12px 8px 34px",
            borderRadius: 6,
            border: "1px solid var(--border)",
            background: "var(--bg-raised)",
            outline: "none",
          }}
        />
      </div>
      <button onClick={onThemeToggle} className="btn btn-ghost" title="Toggle theme">
        {theme === "nord-dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <button className="btn btn-ghost" onClick={() => navigate("/settings")} title="Settings">
        <Settings size={18} />
      </button>
    </header>
  );
}
