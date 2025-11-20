import { memo, useMemo } from "react";
import { useApiData } from "../../hooks/useApiData";
import { API_ENDPOINTS } from "../../config/constants";

function EnergyMetrics() {
  const { data, loading, error } = useApiData(API_ENDPOINTS.energia.dados);

  // Calculate metrics from data
  const metrics = useMemo(() => {
    if (!data?.dados_completos) return null;

    const dados = data.dados_completos;

    // Calculate average efficiency
    const rendimentoMedio =
      dados.reduce((acc, item) => acc + item.percentual_rendimento, 0) / dados.length;

    // Find max efficiency and its time
    const maxRendimento = dados.reduce((max, item) =>
      item.percentual_rendimento > max.percentual_rendimento ? item : max
    );

    // Find min efficiency and its time
    const minRendimento = dados.reduce((min, item) =>
      item.percentual_rendimento < min.percentual_rendimento ? item : min
    );

    // Find max power and its time
    const maxPotencia = dados.reduce((max, item) =>
      item.potencia_kw > max.potencia_kw ? item : max
    );

    return {
      rendimentoMedio,
      maxRendimento,
      minRendimento,
      maxPotencia,
    };
  }, [data]);

  if (loading) {
    return (
      <section className="bg-secondary p-6 rounded-lg">
        <div className="flex items-center justify-center h-40">
          <p className="text-muted">Carregando dados...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-secondary p-6 rounded-lg">
        <div className="flex items-center justify-center h-40">
          <p className="text-red-500">Erro: {error}</p>
        </div>
      </section>
    );
  }

  const metricsData = [
    {
      id: 0,
      title: "Rendimento médio total",
      mainValue: `${metrics.rendimentoMedio.toFixed(2)}%`,
      complementValue: null,
      color: "text-blue-500",
    },
    {
      id: 1,
      title: "Rendimento máximo",
      mainValue: `${metrics.maxRendimento.percentual_rendimento.toFixed(2)}%`,
      complementValue: `às ${metrics.maxRendimento.hora}h`,
      color: "text-green-400",
    },
    {
      id: 2,
      title: "Rendimento mínimo",
      mainValue: `${metrics.minRendimento.percentual_rendimento.toFixed(2)}%`,
      complementValue: `às ${metrics.minRendimento.hora}h`,
      color: "text-yellow-400",
    },
    {
      id: 3,
      title: "Potência Máxima",
      mainValue: `${metrics.maxPotencia.potencia_kw.toFixed(1)} kW`,
      complementValue: `às ${metrics.maxPotencia.hora}h`,
      color: "text-red-400",
    },
  ];

  return (
    <div className="energy__metrics">
      {metricsData.map((metric) => (
        <MetricCard
          key={metric.id}
          title={metric.title}
          mainValue={metric.mainValue}
          complementValue={metric.complementValue}
          color={metric.color}
        />
      ))}
    </div>
  );
}

function MetricCard({ title, mainValue, complementValue, color }) {
  return (
    <article className="p-4 rounded-lg bg-tertiary items-center">
      <div className="flex flex-col justify-around lg:flex-row lg:justify-between lg:items-center h-full gap-1">
        <h3 className="text-primary text-sm xl:text-base">{title}</h3>
        <div className="flex items-baseline gap-2">
          <p className={`text-xl font-bold ${color} xl:text-2xl`}>
            {mainValue}
          </p>
          {complementValue && (
            <span className="hidden text-sm text-muted sm:block">
              {complementValue}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

// Export with memo to prevent unnecessary re-renders
export default memo(EnergyMetrics);
