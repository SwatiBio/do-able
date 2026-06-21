import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import type { ConfigData } from "../types";

export function useConfig() {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const c = await api.config.get();
      setConfig(c);
    } catch (e) {
      console.error("Failed to fetch config", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const update = async (data: Record<string, unknown>) => {
    const updated = await api.config.update(data);
    setConfig(updated);
    return updated;
  };

  return { config, loading, refetch: fetch, update };
}
