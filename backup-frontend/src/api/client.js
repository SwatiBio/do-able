export class ApiError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = "ApiError";
    }
}
async function request(path, options) {
    const res = await fetch(path, {
        headers: { "Content-Type": "application/json", ...options?.headers },
        ...options,
    });
    if (res.status === 204)
        return undefined;
    const data = await res.json();
    if (!res.ok) {
        throw new ApiError(res.status, data.detail || "Request failed");
    }
    return data;
}
export const api = {
    tasks: {
        list: (params) => {
            const qs = params ? "?" + new URLSearchParams(params).toString() : "";
            return request(`/api/tasks${qs}`);
        },
        get: (id) => request(`/api/tasks/${id}`),
        create: (data) => request("/api/tasks", {
            method: "POST",
            body: JSON.stringify(data),
        }),
        update: (id, data) => request(`/api/tasks/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
        delete: (id) => request(`/api/tasks/${id}`, { method: "DELETE" }),
        done: (id) => request(`/api/tasks/${id}/done`, { method: "POST" }),
        undone: (id) => request(`/api/tasks/${id}/undone`, {
            method: "POST",
        }),
        addNote: (id, text) => request(`/api/tasks/${id}/note`, { method: "POST", body: JSON.stringify({ text }) }),
        search: (q) => api.tasks.list({ search: q }),
    },
    dashboard: {
        get: () => request("/api/dashboard"),
    },
    activity: {
        list: (params) => {
            const qs = params ? "?" + new URLSearchParams(params).toString() : "";
            return request(`/api/activity${qs}`);
        },
    },
    config: {
        get: () => request("/api/config"),
        update: (data) => request("/api/config", {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    },
    focus: {
        get: () => request("/api/focus"),
        set: (task_ids) => request("/api/focus", {
            method: "PUT",
            body: JSON.stringify({ task_ids }),
        }),
    },
    notes: {
        list: (params) => {
            const qs = params ? "?" + new URLSearchParams(params).toString() : "";
            return request(`/api/notes${qs}`);
        },
        create: (text, pinned = false) => request("/api/notes", {
            method: "POST",
            body: JSON.stringify({ text, pinned }),
        }),
        update: (id, data) => request(`/api/notes/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
        delete: (id) => request(`/api/notes/${id}`, { method: "DELETE" }),
    },
    bin: {
        list: (params) => {
            const qs = params ? "?" + new URLSearchParams(params).toString() : "";
            return request(`/api/bin${qs}`);
        },
        restore: (id) => request(`/api/bin/${id}/restore`, { method: "POST" }),
        empty: () => request("/api/bin", { method: "DELETE" }),
    },
    backup: {
        list: () => request("/api/backups"),
        create: () => request("/api/backups", {
            method: "POST",
        }),
        restore: (filename) => request(`/api/backups/${filename}/restore`, {
            method: "POST",
        }),
    },
    export: {
        download: (fmt) => {
            window.open(`/api/export/${fmt}`, "_blank");
        },
    },
};
