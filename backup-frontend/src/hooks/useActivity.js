import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
export function useActivity(params) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.activity.list(params);
            setData(res);
        }
        catch (e) {
            console.error("Failed to fetch activity", e);
        }
        finally {
            setLoading(false);
        }
    }, [params]);
    useEffect(() => { fetch(); }, [fetch]);
    return { data, loading, refetch: fetch };
}
