import { useEffect, useState } from "react";

export default function EnergySummary() {
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
      title: "Rendimento Médio",
      value: `${data.estatisticas.rendimento_medio.toFixed(2)}%`,
      color: "text-blue-500",
      icon: "📊",
    },
    {
      id: 1,
      title: "Rendimento Máximo",
      value: `${data.estatisticas.rendimento_maximo.toFixed(2)}%`,
      color: "text-green-400",
      icon: "⬆️",
    },
    {
      id: 2,
      title: "Horário de Pico",
      value: `${data.estatisticas.hora_pico}h`,
      color: "text-yellow-400",
      icon: "🌞",
    },
    {
      id: 3,
      title: "Potência Máxima",
      value: `${data.estatisticas.potencia_max.toFixed(1)} kW`,
      color: "text-red-400",
      icon: "⚡",
    },
  ];

  return (
    <section className="grid grid-cols-1 auto-rows-auto bg-secondary p-6 rounded-lg gap-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Métricas Principais</h2>
        <p className="text-muted text-sm">
          Análise de rendimento dos painéis solares ao longo do dia
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
    </section>
  );
}

function MetricCard({ title, value, color, icon }) {
  return (
    <article className="p-4 rounded-lg bg-tertiary border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="text-muted text-sm">{title}</h3>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
      </div>
    </article>
  );
}
