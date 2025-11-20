import * as d3 from "d3";
import { useCallback, useEffect, useRef, useState } from "react";

export default function HealthScatter() {
  const chartRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/saude/dispersao-colesterol-pressao/")
      .then((response) => {
        if (!response.ok) throw new Error("Erro ao carregar dados");
        return response.json();
      })
      .then((jsonData) => {
        setData(jsonData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const createScatterPlot = useCallback(() => {
    if (!data || !chartRef.current) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll("*").remove();

    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const containerWidth = chartRef.current.offsetWidth;
    const width = containerWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    if (width <= 0) return;

    // Get theme colors
    const styles = getComputedStyle(document.documentElement);
    const textMutedColor = styles.getPropertyValue("--text-muted").trim();
    const textPrimaryColor = styles.getPropertyValue("--text-primary").trim();

    // Create SVG
    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", "100%")
      .attr("height", height + margin.top + margin.bottom)
      .attr(
        "viewBox",
        `0 0 ${containerWidth} ${height + margin.top + margin.bottom}`
      )
      .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xMin = d3.min(data, (d) => d.colesterol);
    const xMax = d3.max(data, (d) => d.colesterol);
    const yMin = d3.min(data, (d) => d.pressao);
    const yMax = d3.max(data, (d) => d.pressao);

    // Add some padding to the domains
    const xPadding = (xMax - xMin) * 0.1 || 10;
    const yPadding = (yMax - yMin) * 0.1 || 10;

    const xScale = d3
      .scaleLinear()
      .domain([xMin - xPadding, xMax + xPadding])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([yMin - yPadding, yMax + yPadding])
      .range([height, 0]);

    // Grid lines
    const makeXGridlines = () => d3.axisBottom(xScale).ticks(5);
    const makeYGridlines = () => d3.axisLeft(yScale).ticks(5);

    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(makeXGridlines().tickSize(-height).tickFormat(""))
      .attr("stroke-opacity", 0.1)
      .attr("color", textMutedColor);

    g.append("g")
      .attr("class", "grid")
      .call(makeYGridlines().tickSize(-width).tickFormat(""))
      .attr("stroke-opacity", 0.1)
      .attr("color", textMutedColor);

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .attr("color", textMutedColor)
      .selectAll("text")
      .attr("fill", textMutedColor);

    g.append("g")
      .call(d3.axisLeft(yScale))
      .attr("color", textMutedColor)
      .selectAll("text")
      .attr("fill", textMutedColor);

    // Axis Labels
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .attr("fill", textMutedColor)
      .attr("font-size", "14px")
      .text("Colesterol (mg/dL)");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -45)
      .attr("text-anchor", "middle")
      .attr("fill", textMutedColor)
      .attr("font-size", "14px")
      .text("Pressão Arterial (mmHg)");

    // Scatter Points
    g.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.colesterol))
      .attr("cy", (d) => yScale(d.pressao))
      .attr("r", 6)
      .attr("fill", "#3b82f6") // Blue color for points
      .attr("stroke", "#1d4ed8")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 8).attr("fill", "#60a5fa");

        // Tooltip
        g.append("text")
          .attr("id", "tooltip")
          .attr("x", xScale(d.colesterol))
          .attr("y", yScale(d.pressao) - 15)
          .attr("text-anchor", "middle")
          .attr("fill", textPrimaryColor)
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .text(`${d.colesterol} mg/dL, ${d.pressao} mmHg`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 6).attr("fill", "#3b82f6");
        d3.select("#tooltip").remove();
      });
  }, [data]);

  useEffect(() => {
    if (data && chartRef.current) {
      createScatterPlot();
    }
  }, [data, createScatterPlot]);

  // Resize Observer
  useEffect(() => {
    if (!chartRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      const timeoutId = setTimeout(() => {
        createScatterPlot();
      }, 100);
      return () => clearTimeout(timeoutId);
    });

    resizeObserver.observe(chartRef.current);
    return () => resizeObserver.disconnect();
  }, [createScatterPlot]);

  // Theme Observer
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (data && chartRef.current) {
        createScatterPlot();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, [data, createScatterPlot]);

  if (loading) {
    return (
      <article className="bg-tertiary p-6 rounded-lg health__scatter">
        <h3 className="text-xl font-medium text-center mb-4">
          Colesterol x Pressão Arterial
        </h3>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <p className="text-sm text-muted">Carregando dados...</p>
        </div>
      </article>
    );
  }

  if (error) {
    return (
      <article className="bg-tertiary p-6 rounded-lg health__scatter">
        <h3 className="text-xl font-medium text-center mb-4">
          Colesterol x Pressão Arterial
        </h3>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <p className="text-sm text-red-500">Erro: {error}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-tertiary p-6 rounded-lg health__scatter">
      <h3 className="text-xl font-medium text-center mb-4">
        Colesterol x Pressão Arterial
      </h3>
      <div ref={chartRef} className="w-full"></div>
    </article>
  );
}
