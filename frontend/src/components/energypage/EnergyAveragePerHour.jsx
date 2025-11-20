import * as d3 from "d3";
import { memo, useCallback, useRef } from "react";
import { useApiData } from "../../hooks/useApiData";
import { useD3Chart } from "../../hooks/useD3Chart";
import { API_ENDPOINTS } from "../../config/constants";
import { getThemeColors, createResponsiveSVG } from "../../utils/d3Utils";

function EnergyAveragePerHour() {
  const chartRef = useRef(null);
  const { data, loading, error } = useApiData(API_ENDPOINTS.energia.rendimento);

  const createRendimentoChart = useCallback(() => {
    if (!data || !chartRef.current) return;

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const { g, width, height } = createResponsiveSVG(chartRef.current, margin, 200);

    if (!g || width <= 0) return;

    // Get theme colors
    const colors = getThemeColors();

    // Prepara dados
    const chartData = data.dados_brutos.map((d) => ({
      hora: d.hora,
      rendimento: d.percentual_rendimento,
    }));

    // Escalas
    const x = d3
      .scaleBand()
      .domain(chartData.map((d) => d.hora))
      .range([0, width])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(chartData, (d) => d.rendimento) * 1.1])
      .range([height, 0]);

    // Eixos
    g
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .attr("color", colors.textMuted)
      .selectAll("text")
      .style("font-size", "12px")
      .attr("fill", colors.textMuted);

    g
      .append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((d) => `${d.toFixed(1)}%`)
      )
      .attr("color", colors.textMuted)
      .selectAll("text")
      .style("font-size", "12px")
      .attr("fill", colors.textMuted);

    // Barras com cores diferentes para cada uma
    const colorScale = d3
      .scaleSequential()
      .domain([0, chartData.length])
      .interpolator(d3.interpolateRainbow);

    g
      .selectAll(".bar")
      .data(chartData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.hora))
      .attr("y", (d) => y(d.rendimento))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.rendimento))
      .attr("fill", (d, i) => colorScale(i))
      .attr("rx", 4)
      .on("mouseover", function () {
        d3.select(this).attr("opacity", 0.7);
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 1);
      });

    // Labels nos valores
    g
      .selectAll(".label")
      .data(chartData)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => x(d.hora) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.rendimento) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", colors.textPrimary)
      .style("font-size", "11px")
      .text((d) => `${d.rendimento.toFixed(1)}%`);
  }, [data]);

  // Use custom hook to manage chart lifecycle (renders, resize, theme changes)
  useD3Chart({
    chartRef,
    renderChart: createRendimentoChart,
    data,
  });

  if (loading) {
    return (
      <section className="bg-secondary p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          Rendimento Médio por Horário
        </h2>
        <div className="flex items-center justify-center h-40">
          <p className="text-muted">Carregando dados...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-secondary p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          Rendimento Médio por Horário
        </h2>
        <div className="flex items-center justify-center h-40">
          <p className="text-red-500">Erro: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <article className="bg-tertiary p-4 rounded-lg energy__average-per-hour">
      <h3 className="text-xl font-semibold mb-4 text-center xl:text-left">
        Rendimento Médio por Horário
      </h3>

      <div ref={chartRef} className="w-full"></div>
    </article>
  );
}

// Export with memo to prevent unnecessary re-renders
export default memo(EnergyAveragePerHour);
