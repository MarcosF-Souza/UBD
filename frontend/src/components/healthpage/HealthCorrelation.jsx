import * as d3 from "d3";
import { useCallback, useEffect, useRef, useState } from "react";
import { API_ENDPOINTS } from "../../config/constants";

export default function HealthCorrelation() {
  const chartRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
  useEffect(() => {
    fetch(API_ENDPOINTS.saude.correlacao)
      .then((response) => {
        if (!response.ok) throw new Error("Erro ao carregar dados");
        return response.json();
      })
      .then((jsonData) => {
        setData(jsonData.matriz_correlacao);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Function to create/update the chart
  const createChart = useCallback(() => {
    if (!data || !chartRef.current) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll("*").remove();

    // Get container dimensions
    const container = chartRef.current;
    const containerWidth = container.offsetWidth;

    // Extract variable names from the correlation matrix
    const variables = Object.keys(data);
    const n = variables.length;

    // Calculate dimensions
    const margin = { top: 40, right: 10, bottom: 20, left: 20 };
    const cellSize = Math.min(
      (containerWidth - margin.left - margin.right) / n,
      80
    );
    const width = cellSize * n;
    const height = cellSize * n;

    if (width <= 0) return;

    // Get theme colors
    const styles = getComputedStyle(document.documentElement);
    const textPrimaryColor = styles.getPropertyValue("--text-primary").trim();
    const textMutedColor = styles.getPropertyValue("--text-muted").trim();
    const bgSecondaryColor = styles.getPropertyValue("--bg-secondary").trim();

    // Create SVG
    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", "100%")
      .attr("height", height + margin.top + margin.bottom)
      .attr(
        "viewBox",
        `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom
        }`
      )
      .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create color scale (diverging: red for negative, blue for positive)
    const colorScale = d3
      .scaleSequential()
      .domain([-1, 1])
      .interpolator(d3.interpolateRdBu);

    // Create scales for positioning
    const xScale = d3
      .scaleBand()
      .domain(variables)
      .range([0, width])
      .padding(0.1);

    const yScale = d3
      .scaleBand()
      .domain(variables)
      .range([0, height])
      .padding(0.1);

    // Prepare data for cells
    const cellData = [];
    variables.forEach((row) => {
      variables.forEach((col) => {
        cellData.push({
          row,
          col,
          value: data[row][col],
        });
      });
    });

    // Draw cells
    const cells = g
      .selectAll(".cell")
      .data(cellData)
      .enter()
      .append("g")
      .attr("class", "cell");

    // Add rectangles
    cells
      .append("rect")
      .attr("x", (d) => xScale(d.col))
      .attr("y", (d) => yScale(d.row))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => colorScale(d.value))
      .attr("stroke", textMutedColor)
      .attr("stroke-width", 0.5)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        // Highlight cell
        d3.select(this)
          .attr("stroke", textPrimaryColor)
          .attr("stroke-width", 2);

        // Create tooltip
        const tooltip = g.append("g").attr("id", "tooltip");

        const tooltipX = xScale(d.col) + xScale.bandwidth() / 2;
        const tooltipY = yScale(d.row) - 10;

        const tooltipText = [
          `${d.row} × ${d.col}`,
          `Correlação: ${d.value.toFixed(3)}`,
        ];

        tooltipText.forEach((text, i) =>
          tooltip
            .append("text")
            .attr("x", tooltipX)
            .attr("y", tooltipY - (tooltipText.length - 1 - i) * 16)
            .attr("text-anchor", "middle")
            .attr("fill", textPrimaryColor)
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .style("pointer-events", "none")
            .text(text)
        );

        // Add background rectangle for better readability
        const bbox = tooltip.node().getBBox();
        tooltip
          .insert("rect", "text")
          .attr("x", bbox.x - 6)
          .attr("y", bbox.y - 4)
          .attr("width", bbox.width + 12)
          .attr("height", bbox.height + 8)
          .attr("fill", bgSecondaryColor)
          .attr("stroke", textMutedColor)
          .attr("stroke-width", 1)
          .attr("rx", 4)
          .style("pointer-events", "none");
      })
      .on("mouseout", function () {
        // Restore cell
        d3.select(this)
          .attr("stroke", textMutedColor)
          .attr("stroke-width", 0.5);

        // Remove tooltip
        d3.select("#tooltip").remove();
      });

    // Add text values in cells
    cells
      .append("text")
      .attr("x", (d) => xScale(d.col) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d.row) + yScale.bandwidth() / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", (d) =>
        Math.abs(d.value) > 0.5 ? "#fff" : textPrimaryColor
      )
      .attr("font-size", `${Math.min(cellSize / 4, 12)}px`)
      .attr("font-weight", "bold")
      .style("pointer-events", "none")
      .text((d) => d.value.toFixed(2));

    // Add X axis labels (top)
    g.selectAll(".x-label")
      .data(variables)
      .enter()
      .append("text")
      .attr("class", "x-label")
      .attr("x", (d) => xScale(d) + xScale.bandwidth() / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", textPrimaryColor)
      .attr("font-size", "14px")
      .attr("font-weight", "600")
      .text((d) => d.charAt(0).toUpperCase() + d.slice(1));

    // Add Y axis labels (left) - vertical orientation
    g.selectAll(".y-label")
      .data(variables)
      .enter()
      .append("text")
      .attr("class", "y-label")
      .attr("x", -10)
      .attr("y", (d) => yScale(d) + yScale.bandwidth() / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", textPrimaryColor)
      .attr("font-size", "14px")
      .attr("font-weight", "600")
      .attr("transform", (d) => {
        const x = -10;
        const y = yScale(d) + yScale.bandwidth() / 2;
        return `rotate(-90, ${x}, ${y})`;
      })
      .text((d) => d.charAt(0).toUpperCase() + d.slice(1));
  }, [data]);

  // Create chart when data is loaded
  useEffect(() => {
    if (data && chartRef.current) {
      createChart();
    }
  }, [data, createChart]);

  // Resize Observer
  useEffect(() => {
    if (!chartRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      const timeoutId = setTimeout(() => {
        createChart();
      }, 100);
      return () => clearTimeout(timeoutId);
    });

    resizeObserver.observe(chartRef.current);
    return () => resizeObserver.disconnect();
  }, [createChart]);

  // Theme Observer
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (data && chartRef.current) {
        createChart();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

    return () => observer.disconnect();
  }, [data, createChart]);

  // Loading state
  if (loading) {
    return (
      <article className="bg-tertiary p-6 rounded-lg h-full">
        <h3 className="text-xl font-medium mb-4">
          Matriz de Correlação entre Variáveis
        </h3>
        <div className="flex flex-col h-full justify-center items-center gap-3">
          <p className="text-sm text-muted">Carregando dados...</p>
        </div>
      </article>
    );
  }

  // Error state
  if (error) {
    return (
      <article className="bg-tertiary p-6 rounded-lg h-full">
        <h3 className="text-xl font-medium mb-4">
          Matriz de Correlação entre Variáveis
        </h3>
        <div className="flex flex-col h-full justify-center items-center gap-3">
          <p className="text-sm text-red-500">Erro: {error}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-col bg-tertiary p-6 rounded-lg h-full">
      <h3 className="text-xl font-medium text-center xl:text-left">
        Matriz de Correlação entre Variáveis
      </h3>
      <div ref={chartRef}></div>
    </article>
  );
}
