export interface Task {
  id: number;
  title: string;
  description: string;
  status: "not_started" | "started" | "done";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  category: string;
  tags: string[];
  fields: Record<string, string>;
  recur: string | null;
  depends_on: { id: number; title: string }[];
  notes: { id: number; text: string; timestamp: string }[];
  created_at: string;
  updated_at: string;
}

export interface TaskSection {
  name: string;
  tasks: Task[];
}

export interface TaskListResponse {
  tasks?: Task[];
  sections?: TaskSection[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface DashboardData {
  counts: { total: number; not_started: number; started: number; done: number };
  overdue: number;
  due_today: number;
  by_priority: Record<string, number>;
  by_category: Record<string, number>;
  task_count_by_day: { date: string; count: number }[];
  weekly_recap: string;
  monthly_recap: string;
  recent_activity: { action: string; task_id?: number; timestamp: string; details?: string }[];
}

export interface ActivityEntry {
  id: number;
  task_id: number | null;
  action: string;
  details: string;
  timestamp: string;
}

export interface ActivityResponse {
  entries: ActivityEntry[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface ConfigData {
  theme: string;
  date_mode: string;
  notifications: boolean;
  per_page: number;
}

export interface ScratchNote {
  id: number;
  text: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedNotes {
  notes: ScratchNote[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface BackupInfo {
  filename: string;
  size: number;
  created_at: string;
}
