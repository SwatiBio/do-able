export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json();
  if (!res.ok) {
    throw new ApiError(res.status, data.detail || "Request failed");
  }
  return data as T;
}

export const api = {
  tasks: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<import("../types").TaskListResponse>(`/api/tasks${qs}`);
    },
    get: (id: number) => request<import("../types").Task>(`/api/tasks/${id}`),
    create: (data: Record<string, unknown>) =>
      request<import("../types").Task>("/api/tasks", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Record<string, unknown>) =>
      request<import("../types").Task>(`/api/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/api/tasks/${id}`, { method: "DELETE" }),
    done: (id: number) =>
      request<{ task: import("../types").Task; recurrence?: import("../types").Task }>(
        `/api/tasks/${id}/done`,
        { method: "POST" }
      ),
    undone: (id: number) =>
      request<import("../types").Task>(`/api/tasks/${id}/undone`, {
        method: "POST",
      }),
    addNote: (id: number, text: string) =>
      request<{ id: number; text: string; timestamp: string }>(
        `/api/tasks/${id}/note`,
        { method: "POST", body: JSON.stringify({ text }) }
      ),
    search: (q: string) => api.tasks.list({ search: q }),
  },
  dashboard: {
    get: () => request<import("../types").DashboardData>("/api/dashboard"),
  },
  activity: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<import("../types").ActivityResponse>(`/api/activity${qs}`);
    },
  },
  config: {
    get: () => request<import("../types").ConfigData>("/api/config"),
    update: (data: Record<string, unknown>) =>
      request<import("../types").ConfigData>("/api/config", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },
  focus: {
    get: () => request<{ task_ids: number[] }>("/api/focus"),
    set: (task_ids: number[]) =>
      request<{ task_ids: number[] }>("/api/focus", {
        method: "PUT",
        body: JSON.stringify({ task_ids }),
      }),
  },
  notes: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<import("../types").PaginatedNotes>(`/api/notes${qs}`);
    },
    create: (text: string, pinned = false) =>
      request<import("../types").ScratchNote>("/api/notes", {
        method: "POST",
        body: JSON.stringify({ text, pinned }),
      }),
    update: (id: number, data: Record<string, unknown>) =>
      request<import("../types").ScratchNote>(`/api/notes/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/api/notes/${id}`, { method: "DELETE" }),
  },
  bin: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<import("../types").TaskListResponse>(`/api/bin${qs}`);
    },
    restore: (id: number) =>
      request<{ ok: boolean }>(`/api/bin/${id}/restore`, { method: "POST" }),
    empty: () => request<void>("/api/bin", { method: "DELETE" }),
  },
  backup: {
    list: () => request<{ backups: import("../types").BackupInfo[] }>("/api/backups"),
    create: () =>
      request<import("../types").BackupInfo>("/api/backups", {
        method: "POST",
      }),
    restore: (filename: string) =>
      request<{ ok: boolean }>(`/api/backups/${filename}/restore`, {
        method: "POST",
      }),
  },
  export: {
    download: (fmt: string) => {
      window.open(`/api/export/${fmt}`, "_blank");
    },
  },
};
