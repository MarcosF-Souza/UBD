import { useEffect, useCallback } from "react";

/**
 * Custom hook for D3 chart management
 * Handles theme changes, window resizing, and chart re-rendering
 * 
 * @param {Object} params
 * @param {React.RefObject} params.chartRef - Ref to chart container
 * @param {Function} params.renderChart - Chart rendering function
 * @param {any} params.data - Chart data (triggers re-render when changed)
 * @param {number} params.debounceMs - Debounce delay for resize (default: 150ms)
 */
export function useD3Chart({ chartRef, renderChart, data, debounceMs = 150 }) {
    // Memoize the render function
    const memoizedRender = useCallback(() => {
        if (chartRef.current && data) {
            renderChart();
        }
    }, [chartRef, data, renderChart]);

    // Initial render when data changes
    useEffect(() => {
        memoizedRender();
    }, [memoizedRender]);

    // Handle window resize with debouncing
    useEffect(() => {
        if (!chartRef.current) return;

        let timeoutId;
        const debouncedResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                memoizedRender();
            }, debounceMs);
        };

        const resizeObserver = new ResizeObserver(debouncedResize);
        resizeObserver.observe(chartRef.current);

        return () => {
            clearTimeout(timeoutId);
            resizeObserver.disconnect();
        };
    }, [chartRef, memoizedRender, debounceMs]);

    // Handle theme changes
    useEffect(() => {
        const observer = new MutationObserver(() => {
            memoizedRender();
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme", "class"],
        });

        return () => {
            observer.disconnect();
        };
    }, [memoizedRender]);
}
