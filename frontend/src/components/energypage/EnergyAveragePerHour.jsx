import * as d3 from "d3";
import { useCallback, useEffect, useRef, useState } from "react";

export default function EnergyAveragePerHour() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/energia/rendimento/")
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

  const createRendimentoChart = useCallback(() => {
    if (!data || !chartRef.current) return;

    // Limpa gráfico anterior
    d3.select(chartRef.current).selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const containerWidth = chartRef.current.offsetWidth;
    const width = containerWidth - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    // Garante que o width seja válido
    if (width <= 0) return;

    // Obtém as cores do tema atual
    const styles = getComputedStyle(document.documentElement);
    const textMutedColor = styles.getPropertyValue("--text-muted").trim();
    const textPrimaryColor = styles.getPropertyValue("--text-primary").trim();

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", "100%")
      .attr("height", height + margin.top + margin.bottom)
      .attr(
        "viewBox",
        `0 0 ${containerWidth} ${height + margin.top + margin.bottom}`
      )
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

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
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .attr("color", textMutedColor)
      .selectAll("text")
      .style("font-size", "12px")
      .attr("fill", textMutedColor);

    svg
      .append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((d) => `${d.toFixed(1)}%`)
      )
      .attr("color", textMutedColor)
      .selectAll("text")
      .style("font-size", "12px")
      .attr("fill", textMutedColor);

    // Barras com cores diferentes para cada uma
    const colorScale = d3
      .scaleSequential()
      .domain([0, chartData.length])
      .interpolator(d3.interpolateRainbow);

    svg
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
    svg
      .selectAll(".label")
      .data(chartData)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => x(d.hora) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.rendimento) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", textPrimaryColor)
      .style("font-size", "11px")
      .text((d) => `${d.rendimento.toFixed(1)}%`);
  }, [data]);

  useEffect(() => {
    if (data && chartRef.current) {
      createRendimentoChart();
    }
  }, [data, createRendimentoChart]);

  // Adiciona responsividade com ResizeObserver
  useEffect(() => {
    if (!chartRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      // Debounce para evitar muitas renderizações
      const timeoutId = setTimeout(() => {
        createRendimentoChart();
      }, 100);

      return () => clearTimeout(timeoutId);
    });

    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [createRendimentoChart]);

  // Observa mudanças no tema e recria o gráfico
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (data && chartRef.current) {
        createRendimentoChart();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      observer.disconnect();
    };
  }, [data, createRendimentoChart]);

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
