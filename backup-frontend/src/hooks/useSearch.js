import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useDebounce } from "./useDebounce";
export function useSearch(query) {
    const debounced = useDebounce(query, 200);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!debounced.trim()) {
            setResults([]);
            return;
        }
        setLoading(true);
        api.tasks.search(debounced).then((res) => {
            setResults(res.tasks || []);
        }).catch(console.error).finally(() => setLoading(false));
    }, [debounced]);
    return { results, loading };
}
