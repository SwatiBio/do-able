import { ReactNode, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface LayoutProps {
  children: ReactNode;
  theme: string;
  onThemeToggle: () => void;
}

export default function Layout({ children, theme, onThemeToggle }: LayoutProps) {
  const location = useLocation();
  const isFocus = location.pathname.startsWith("/focus");
  const [sidebarOpen, setSidebarOpen] = useState(!isFocus);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          theme={theme}
          onThemeToggle={onThemeToggle}
        />
        <main style={{ flex: 1, padding: "24px", overflow: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
