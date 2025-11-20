import * as d3 from "d3";

/**
 * D3 utility functions for chart creation
 * Shared utilities to reduce code duplication across chart components
 */

/**
 * Get current theme colors from CSS variables
 * @returns {Object} Theme colors object
 */
export function getThemeColors() {
    const styles = getComputedStyle(document.documentElement);

    return {
        textPrimary: styles.getPropertyValue("--text-primary").trim() || "#000",
        textMuted: styles.getPropertyValue("--text-muted").trim() || "#666",
        bgPrimary: styles.getPropertyValue("--bg-primary").trim() || "#fff",
        bgSecondary: styles.getPropertyValue("--bg-secondary").trim() || "#f5f5f5",
        bgTertiary: styles.getPropertyValue("--bg-tertiary").trim() || "#e5e5e5",
    };
}

/**
 * Create a responsive SVG element
 * @param {HTMLElement} container - DOM element to append SVG to
 * @param {Object} margin - Margin object {top, right, bottom, left}
 * @param {number} height - Chart height (without margins)
 * @returns {Object} {svg, g, width, height, containerWidth}
 */
export function createResponsiveSVG(container, margin, height) {
    // Clear previous chart
    d3.select(container).selectAll("*").remove();

    const containerWidth = container.offsetWidth;
    const width = containerWidth - margin.left - margin.right;

    if (width <= 0) {
        return { svg: null, g: null, width: 0, height, containerWidth };
    }

    const svg = d3
        .select(container)
        .append("svg")
        .attr("width", "100%")
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", `0 0 ${containerWidth} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    return { svg, g, width, height, containerWidth };
}

/**
 * Add grid lines to a chart
 * @param {d3.Selection} g - D3 selection of chart group
 * @param {d3.Scale} xScale - X scale
 * @param {d3.Scale} yScale - Y scale
 * @param {number} width - Chart width
 * @param {number} height - Chart height
 * @param {string} color - Grid line color
 */
export function addGridLines(g, xScale, yScale, width, height, color) {
    // Vertical grid lines
    g.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickSize(-height).tickFormat(""))
        .attr("stroke-opacity", 0.1)
        .attr("color", color);

    // Horizontal grid lines
    g.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(""))
        .attr("stroke-opacity", 0.1)
        .attr("color", color);
}

/**
 * Proper debounce function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}
