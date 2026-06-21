import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import type { Task, TaskListResponse } from "../types";

export function useTasks(params?: Record<string, string>) {
  const [data, setData] = useState<TaskListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.tasks.list(params);
      setData(res);
    } catch (e) {
      console.error("Failed to fetch tasks", e);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useTask(id: number) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.tasks.get(id).then(setTask).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  return { task, loading, setTask };
}
