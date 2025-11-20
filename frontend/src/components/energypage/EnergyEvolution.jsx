import * as d3 from "d3";
import { useCallback, useEffect, useRef } from "react";
import { API_ENDPOINTS } from "../../config/constants";

export default function EnergyEvolution() {
  const chartRef = useRef(null);
  const dataRef = useRef(null);

  // Function to create/update the chart
  const createChart = useCallback(() => {
    if (!chartRef.current || !dataRef.current) return;

    const container = chartRef.current;
    const data = dataRef.current;

    // Clear previous chart
    d3.select(container).selectAll("*").remove();

    // Get container dimensions
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const containerWidth = container.offsetWidth;
    const width = containerWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    if (width <= 0) return;

    // Get current theme colors
    const computedStyle = getComputedStyle(document.documentElement);
    const textColor =
      computedStyle.getPropertyValue("--text-primary").trim() || "#000";
    const textMutedColor =
      computedStyle.getPropertyValue("--text-muted").trim() || "#999";
    const bgColor =
      computedStyle.getPropertyValue("--bg-secondary").trim() || "#1a1a1a";
    const lineColor = "#1e88e5"; // Blue color for the line
    const pointColor = "#1e88e5"; // Blue color for points

    // Create SVG with viewBox for responsiveness
    const svg = d3
      .select(container)
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

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data.horas))
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([40, 48]) // Fixed domain to match the reference image
      .range([height, 0]);

    // Add gridlines
    g.append("g")
      .attr("class", "grid")
      .attr("opacity", 0.1)
      .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(""))
      .selectAll("line")
      .attr("stroke", textMutedColor);

    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .attr("opacity", 0.1)
      .call(d3.axisBottom(xScale).tickSize(-height).tickFormat(""))
      .selectAll("line")
      .attr("stroke", textMutedColor);

    // Add X axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat((d) => `${d}`))
      .selectAll("text")
      .attr("fill", textColor)
      .style("font-size", "12px");

    g.selectAll(".domain, .tick line").attr("stroke", textMutedColor);

    // Add Y axis
    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .attr("fill", textColor)
      .style("font-size", "12px");

    g.selectAll(".domain, .tick line").attr("stroke", textMutedColor);

    // Add X axis label
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .attr("fill", textColor)
      .style("font-size", "14px")
      .text("Hora do Dia");

    // Add Y axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -45)
      .attr("text-anchor", "middle")
      .attr("fill", textColor)
      .style("font-size", "14px")
      .text("Rendimento (%)");

    // Create line generator
    const line = d3
      .line()
      .x((d, i) => xScale(data.horas[i]))
      .y((d) => yScale(d))
      .curve(d3.curveMonotoneX); // Smooth curve

    // Add the line
    g.append("path")
      .datum(data.eficiencia)
      .attr("fill", "none")
      .attr("stroke", lineColor)
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add data points with hover interactions
    g.selectAll(".dot")
      .data(data.eficiencia)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d, i) => xScale(data.horas[i]))
      .attr("cy", (d) => yScale(d))
      .attr("r", 5)
      .attr("fill", pointColor)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        const index = data.eficiencia.indexOf(d);
        const dadoCompleto = data.dadosBrutos[index];

        // Enlarge point
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 8)
          .attr("fill", "#60a5fa");

        // Create tooltip
        const tooltip = g
          .append("g")
          .attr("id", "tooltip")
          .attr("class", "tooltip");

        const tooltipX = xScale(data.horas[index]);
        const tooltipY = yScale(d) - 20;

        // Tooltip text content
        const tooltipText = [
          `Rendimento: ${dadoCompleto.percentual_rendimento.toFixed(2)}%`,
          `Temperatura: ${dadoCompleto.temperatura_c}°C`,
          `Potência: ${dadoCompleto.potencia_kw} kW`,
        ];

        tooltipText.forEach((text, i) =>
          tooltip
            .append("text")
            .attr("x", tooltipX)
            .attr("y", tooltipY - (tooltipText.length - 1 - i) * 16)
            .attr("text-anchor", "middle")
            .attr("fill", textColor)
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
          .attr("fill", bgColor)
          .attr("stroke", textMutedColor)
          .attr("stroke-width", 1)
          .attr("rx", 4)
          .style("pointer-events", "none");
      })
      .on("mouseout", function () {
        // Restore point
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 5)
          .attr("fill", pointColor);

        // Remove tooltip
        d3.select("#tooltip").remove();
      });
  }, []);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          API_ENDPOINTS.energia.rendimento
        );
        const json = await response.json();

        if (json.dados_mapa_calor && json.dados_brutos) {
          dataRef.current = {
            horas: json.dados_mapa_calor.horas,
            eficiencia: json.dados_mapa_calor.eficiencia,
            dadosBrutos: json.dados_brutos,
          };
          createChart();
        }
      } catch (error) {
        console.error("Error fetching energy evolution data:", error);
      }
    };

    fetchData();
  }, [createChart]);

  // Handle resize
  useEffect(() => {
    if (!chartRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      createChart();
    });

    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [createChart]);

  // Handle theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      createChart();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => {
      observer.disconnect();
    };
  }, [createChart]);

  return (
    <article className="bg-tertiary energy__evolution p-4 rounded-lg">
      <h3 className="text-xl font-semibold mb-4 text-center xl:text-left">
        Evolução da Eficiência ao Longo do Dia
      </h3>
      <div ref={chartRef} className="w-full h-full"></div>
    </article>
  );
}
