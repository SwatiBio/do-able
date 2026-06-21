import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import type { ActivityResponse } from "../types";

export function useActivity(params?: Record<string, string>) {
  const [data, setData] = useState<ActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.activity.list(params);
      setData(res);
    } catch (e) {
      console.error("Failed to fetch activity", e);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}
