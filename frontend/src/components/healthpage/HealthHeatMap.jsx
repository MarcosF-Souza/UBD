import * as d3 from "d3";
import { useCallback, useEffect, useRef, useState } from "react";

export default function HealthHeatMap() {
  const chartRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
  useEffect(() => {
    fetch("http://localhost:8000/api/saude/mapa-calor-correlacao/")
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
    const margin = { top: 40, right: 80, bottom: 40, left: 40 };
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
        `0 0 ${width + margin.left + margin.right} ${
          height + margin.top + margin.bottom
        }`
      )
      .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create color scale (sequential: white to dark red)
    const colorScale = d3
      .scaleSequential()
      .domain([0.85, 1]) // Focus on high correlations
      .interpolator(d3.interpolateReds);

    // Create scales for positioning
    const xScale = d3
      .scaleBand()
      .domain(variables)
      .range([0, width])
      .padding(0.1); // Increased padding for more spacing

    const yScale = d3
      .scaleBand()
      .domain(variables)
      .range([0, height])
      .padding(0.1); // Increased padding for more spacing

    // Prepare data for cells (lower triangular matrix only, excluding diagonal)
    const cellData = [];
    variables.forEach((row, rowIndex) => {
      variables.forEach((col, colIndex) => {
        // Only include lower triangle (rowIndex > colIndex)
        if (rowIndex > colIndex) {
          cellData.push({
            row,
            col,
            value: data[row][col],
          });
        }
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
      .attr("fill", (d) => (d.value > 0.93 ? "#fff" : textPrimaryColor))
      .attr("font-size", `${Math.min(cellSize / 4, 12)}px`)
      .attr("font-weight", "bold")
      .style("pointer-events", "none")
      .text((d) => d.value.toFixed(2));

    // Add X axis labels (bottom) - increased distance from cells
    g.selectAll(".x-label")
      .data(variables)
      .enter()
      .append("text")
      .attr("class", "x-label")
      .attr("x", (d) => xScale(d) + xScale.bandwidth() / 2)
      .attr("y", height + 30) // Increased from 20 to 30 for more spacing
      .attr("text-anchor", "middle")
      .attr("fill", textPrimaryColor)
      .attr("font-size", "14px")
      .attr("font-weight", "600")
      .text((d) => d.charAt(0).toUpperCase() + d.slice(1));

    // Add Y axis labels (left) - vertical orientation with increased distance
    g.selectAll(".y-label")
      .data(variables)
      .enter()
      .append("text")
      .attr("class", "y-label")
      .attr("x", -20) // Increased from -10 to -20 for more spacing
      .attr("y", (d) => yScale(d) + yScale.bandwidth() / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", textPrimaryColor)
      .attr("font-size", "14px")
      .attr("font-weight", "600")
      .attr("transform", (d) => {
        const x = -20; // Updated to match new x position
        const y = yScale(d) + yScale.bandwidth() / 2;
        return `rotate(-90, ${x}, ${y})`;
      })
      .text((d) => d.charAt(0).toUpperCase() + d.slice(1));

    // Add color legend (vertical on the right)
    // Make legend height proportional to chart height (80% of chart height)
    const legendHeight = height * 0.8;
    const legendWidth = 20;
    const legendX = width + 20;
    const legendY = (height - legendHeight) / 2;

    // Create gradient for legend
    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "heatmap-gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");

    // Add gradient stops
    const numStops = 10;
    for (let i = 0; i <= numStops; i++) {
      const value = 0.85 + (0.15 * i) / numStops;
      gradient
        .append("stop")
        .attr("offset", `${(i / numStops) * 100}%`)
        .attr("stop-color", colorScale(value));
    }

    // Draw legend rectangle
    g.append("rect")
      .attr("x", legendX)
      .attr("y", legendY)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#heatmap-gradient)")
      .attr("stroke", textMutedColor)
      .attr("stroke-width", 0.5);

    // Add legend labels
    g.append("text")
      .attr("x", legendX + legendWidth + 5)
      .attr("y", legendY + legendHeight)
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "middle")
      .attr("fill", textMutedColor)
      .attr("font-size", "11px")
      .text("0.85");

    g.append("text")
      .attr("x", legendX + legendWidth + 5)
      .attr("y", legendY)
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "middle")
      .attr("fill", textMutedColor)
      .attr("font-size", "11px")
      .text("1.00");

    // Add legend title (vertical, on the right side of the legend)
    const legendTitleX = legendX + legendWidth + 35;
    const legendTitleY = legendY + legendHeight / 2;

    g.append("text")
      .attr("x", legendTitleX)
      .attr("y", legendTitleY)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", textPrimaryColor)
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("transform", `rotate(-90, ${legendTitleX}, ${legendTitleY})`)
      .text("Coeficiente de Correlação");
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
      <article className="flex flex-col bg-tertiary p-6 rounded-lg h-full">
        <h3 className="text-xl font-medium mb-4">
          Mapa de Calor de Correlação
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
      <article className="flex flex-col bg-tertiary p-6 rounded-lg h-full">
        <h3 className="text-xl font-medium mb-4">
          Mapa de Calor de Correlação
        </h3>
        <div className="flex flex-col h-full justify-center items-center gap-3">
          <p className="text-sm text-red-500">Erro: {error}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-col bg-tertiary p-6 rounded-lg h-full health__heat-map">
      <h3 className="text-xl font-medium mb-4 text-center xl:text-left">
        Mapa de Calor de Correlação
      </h3>
      <div ref={chartRef} className="w-full h-full"></div>
    </article>
  );
}
