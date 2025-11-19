import * as d3 from "d3";
import { useCallback, useEffect, useRef, useState } from "react";

export default function EnergyHeatMap() {
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

  const createHeatMap = useCallback(() => {
    if (!data || !chartRef.current) return;

    // Limpa gráfico anterior
    d3.select(chartRef.current).selectAll("*").remove();

    const margin = { top: 40, right: 100, bottom: 60, left: 80 };
    const containerWidth = chartRef.current.offsetWidth;
    const width = containerWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Garante que o width seja válido
    if (width <= 0) return;

    // Obtém as cores do tema atual
    const styles = getComputedStyle(document.documentElement);
    const textMutedColor = styles.getPropertyValue("--text-muted").trim();

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

    // Prepare data
    const heatmapData = data.dados_completos.map((d) => ({
      hora: d.hora,
      eficiencia: d.percentual_rendimento,
    }));

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(heatmapData.map((d) => d.hora))
      .range([0, width])
      .padding(0.05);

    const yScale = d3
      .scaleBand()
      .domain(["Eficiência"])
      .range([0, height])
      .padding(0.1);

    // Color scale - from light yellow to dark red
    const minEficiencia = d3.min(heatmapData, (d) => d.eficiencia);
    const maxEficiencia = d3.max(heatmapData, (d) => d.eficiencia);

    const colorScale = d3
      .scaleSequential()
      .domain([minEficiencia, maxEficiencia])
      .interpolator(d3.interpolateYlOrRd);

    // Draw cells
    g.selectAll("rect")
      .data(heatmapData)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.hora))
      .attr("y", yScale("Eficiência"))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => colorScale(d.eficiencia))
      .attr("stroke", "#1a1a1a")
      .attr("stroke-width", 1)
      .attr("rx", 4)
      .style("cursor", "pointer")
      .on("mouseover", function () {
        d3.select(this).attr("opacity", 0.8);
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 1);
      });

    // Add text labels on cells
    g.selectAll("text.cell-value")
      .data(heatmapData)
      .enter()
      .append("text")
      .attr("class", "cell-value")
      .attr("x", (d) => xScale(d.hora) + xScale.bandwidth() / 2)
      .attr("y", yScale("Eficiência") + yScale.bandwidth() / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", (d) =>
        d.eficiencia > (minEficiencia + maxEficiencia) / 2 ? "#fff" : "#000"
      )
      .attr("font-size", "14px")
      .attr("font-weight", "600")
      .text((d) => d.eficiencia.toFixed(1))
      .style("pointer-events", "none");

    // X axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .attr("color", textMutedColor)
      .selectAll("text")
      .style("font-size", "12px")
      .attr("fill", textMutedColor);

    g.selectAll(".domain, .tick line").attr("stroke", textMutedColor);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale))
      .attr("color", textMutedColor)
      .selectAll("text")
      .style("font-size", "12px")
      .attr("fill", textMutedColor);

    // X axis label
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + 45)
      .attr("text-anchor", "middle")
      .attr("fill", textMutedColor)
      .attr("font-size", "14px")
      .attr("font-weight", "500")
      .text("Hora do Dia");

    // Color legend
    const legendWidth = 20;
    const legendHeight = height;
    const legendSteps = 100;

    const legend = g
      .append("g")
      .attr("transform", `translate(${width + 20}, 0)`);

    // Create gradient
    const defs = svg.append("defs");
    const linearGradient = defs
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");

    linearGradient
      .selectAll("stop")
      .data(
        d3.range(legendSteps).map((i) => ({
          offset: `${(i / (legendSteps - 1)) * 100}%`,
          color: colorScale(
            minEficiencia +
              (i / (legendSteps - 1)) * (maxEficiencia - minEficiencia)
          ),
        }))
      )
      .enter()
      .append("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color);

    legend
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)")
      .attr("stroke", textMutedColor)
      .attr("rx", 4);

    // Legend axis
    const legendScale = d3
      .scaleLinear()
      .domain([minEficiencia, maxEficiencia])
      .range([legendHeight, 0]);

    legend
      .append("g")
      .attr("transform", `translate(${legendWidth}, 0)`)
      .call(
        d3
          .axisRight(legendScale)
          .ticks(5)
          .tickFormat((d) => `${d.toFixed(1)}`)
      )
      .attr("color", textMutedColor)
      .selectAll("text")
      .style("font-size", "11px")
      .attr("fill", textMutedColor);

    legend.selectAll(".domain, .tick line").attr("stroke", textMutedColor);

    // Legend label
    legend
      .append("text")
      .attr("x", legendWidth / 2)
      .attr("y", legendHeight + 30)
      .attr("text-anchor", "middle")
      .attr("fill", textMutedColor)
      .attr("font-size", "12px")
      .text("Rendimento (%)");
  }, [data]);

  useEffect(() => {
    if (data && chartRef.current) {
      createHeatMap();
    }
  }, [data, createHeatMap]);

  // Adiciona responsividade com ResizeObserver
  useEffect(() => {
    if (!chartRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      // Debounce para evitar muitas renderizações
      const timeoutId = setTimeout(() => {
        createHeatMap();
      }, 100);

      return () => clearTimeout(timeoutId);
    });

    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [createHeatMap]);

  // Observa mudanças no tema e recria o gráfico
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (data && chartRef.current) {
        createHeatMap();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      observer.disconnect();
    };
  }, [data, createHeatMap]);

  if (loading) {
    return (
      <article className="flex flex-col bg-tertiary p-4 rounded-lg gap-4 energy__heat-map">
        <h3 className="text-xl font-semibold">Heat Map</h3>
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <p className="text-sm text-muted">Carregando dados...</p>
        </div>
      </article>
    );
  }

  if (error) {
    return (
      <article className="flex flex-col bg-tertiary p-4 rounded-lg gap-4 energy__heat-map">
        <h3 className="text-xl font-semibold">Heat Map</h3>
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <p className="text-sm text-red-500">Erro: {error}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-tertiary p-4 rounded-lg energy__heat-map">
      <h3 className="text-xl font-semibold mb-4">Eficiência por Hora do Dia</h3>

      <div ref={chartRef} className="w-full"></div>
    </article>
  );
}
