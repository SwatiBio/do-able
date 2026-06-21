import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
export function useTasks(params) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.tasks.list(params);
            setData(res);
        }
        catch (e) {
            console.error("Failed to fetch tasks", e);
        }
        finally {
            setLoading(false);
        }
    }, [params]);
    useEffect(() => { fetch(); }, [fetch]);
    return { data, loading, refetch: fetch };
}
export function useTask(id) {
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(true);
        api.tasks.get(id).then(setTask).catch(console.error).finally(() => setLoading(false));
    }, [id]);
    return { task, loading, setTask };
}
