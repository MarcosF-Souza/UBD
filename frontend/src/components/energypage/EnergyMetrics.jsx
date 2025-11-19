import { useEffect, useState } from "react";

export default function EnergyMetrics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const metrics = [
    {
      id: 0,
      title: "Rendimento médio total",
      value: `${data.estatisticas.rendimento_medio.toFixed(2)}%`,
      color: "text-blue-500",
      icon: "📊",
    },
    {
      id: 1,
      title: "Rendimento máximo",
      value: `${data.estatisticas.rendimento_maximo.toFixed(2)}%`,
      color: "text-green-400",
      icon: "⬆️",
    },
    {
      id: 2,
      title: "Rendimento mínimo",
      value: `${data.estatisticas.hora_pico}h`,
      color: "text-yellow-400",
      icon: "🌞",
    },
    {
      id: 3,
      title: "Potência Máxima",
      value: `${data.estatisticas.potencia_max.toFixed(1)} kW às ${
        data.estatisticas.hora_pico
      }h`,
      color: "text-red-400",
      icon: "⚡",
    },
  ];

  return (
    <div className="energy__metrics">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.id}
          title={metric.title}
          value={metric.value}
          color={metric.color}
          icon={metric.icon}
        />
      ))}
    </div>
  );
}

function MetricCard({ title, value, color }) {
  return (
    <article className="p-4 rounded-lg bg-tertiary items-center">
      <div className="flex flex-col justify-between lg:flex-row lg:justify-between lg:items-center h-full gap-1">
        <h3 className="text-muted text-sm xl:text-base">{title}</h3>
        <p className={`text-xl font-bold ${color}`}>{value}</p>
      </div>
    </article>
  );
}
