import * as d3 from "d3";
import { useCallback, useEffect, useRef, useState } from "react";

export default function EnergyScatter() {
  const chartRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/energia/dados/")
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

  // Function to calculate linear regression
  const calculateLinearRegression = (data) => {
    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    data.forEach((d) => {
      sumX += d.temperatura_c;
      sumY += d.potencia_kw;
      sumXY += d.temperatura_c * d.potencia_kw;
      sumXX += d.temperatura_c * d.temperatura_c;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  };

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

    const scatterData = data.dados_completos;

    // Scales
    const xMin = d3.min(scatterData, (d) => d.temperatura_c);
    const xMax = d3.max(scatterData, (d) => d.temperatura_c);
    const yMin = d3.min(scatterData, (d) => d.potencia_kw);
    const yMax = d3.max(scatterData, (d) => d.potencia_kw);

    // Add some padding to the domains
    const xPadding = (xMax - xMin) * 0.1;
    const yPadding = (yMax - yMin) * 0.1;

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
      .text("Temperatura (°C)");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -45)
      .attr("text-anchor", "middle")
      .attr("fill", textMutedColor)
      .attr("font-size", "14px")
      .text("Potência (kW)");

    // Linear Regression Line
    const { slope, intercept } = calculateLinearRegression(scatterData);

    const x1 = xMin - xPadding;
    const y1 = slope * x1 + intercept;
    const x2 = xMax + xPadding;
    const y2 = slope * x2 + intercept;

    g.append("line")
      .attr("x1", xScale(x1))
      .attr("y1", yScale(y1))
      .attr("x2", xScale(x2))
      .attr("y2", yScale(y2))
      .attr("stroke", "#ff4d4d") // Red color for trend line
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    // Scatter Points
    g.selectAll("circle")
      .data(scatterData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.temperatura_c))
      .attr("cy", (d) => yScale(d.potencia_kw))
      .attr("r", 6)
      .attr("fill", "#3b82f6") // Blue color for points
      .attr("stroke", "#1d4ed8")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 8).attr("fill", "#60a5fa");

        // Tooltip (simple title for now, could be a div)
        g.append("text")
          .attr("id", "tooltip")
          .attr("x", xScale(d.temperatura_c))
          .attr("y", yScale(d.potencia_kw) - 15)
          .attr("text-anchor", "middle")
          .attr("fill", textPrimaryColor)
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .text(`${d.temperatura_c}°C, ${d.potencia_kw}kW`);
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
      <article className="flex flex-col bg-tertiary p-4 rounded-lg gap-4 energy__scatter">
        <h3 className="text-xl font-semibold">Scatter Plot</h3>
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <p className="text-sm text-muted">Carregando dados...</p>
        </div>
      </article>
    );
  }

  if (error) {
    return (
      <article className="flex flex-col bg-tertiary p-4 rounded-lg gap-4 energy__scatter">
        <h3 className="text-xl font-semibold">Scatter Plot</h3>
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <p className="text-sm text-red-500">Erro: {error}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-tertiary p-4 rounded-lg energy__scatter">
      <h3 className="text-xl font-semibold mb-4 text-center xl:text-left">
        Temperatura vs Potência
      </h3>
      <div ref={chartRef} className="w-full h-full"></div>
    </article>
  );
}
