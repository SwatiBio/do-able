import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import type { DashboardData } from "../types";

export function useStats() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.dashboard.get();
      setData(d);
    } catch (e) {
      console.error("Failed to fetch dashboard", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}
