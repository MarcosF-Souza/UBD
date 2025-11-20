import { useEffect, useState } from "react";

/**
 * Custom hook for fetching data from API
 * Provides loading, error, and data states with automatic error handling
 * 
 * @param {string} url - API endpoint URL to fetch from
 * @param {Array} dependencies - Optional dependency array for re-fetching
 * @returns {Object} { data, loading, error, refetch }
 */
export function useApiData(url, dependencies = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const jsonData = await response.json();
            setData(jsonData);
        } catch (err) {
            setError(err.message);
            console.error(`Error fetching data from ${url}:`, err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, ...dependencies]);

    return { data, loading, error, refetch: fetchData };
}
