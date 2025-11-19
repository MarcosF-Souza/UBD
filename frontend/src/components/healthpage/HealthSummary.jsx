export default function HealthSummary() {
  const stats = [
    { label: "Pacientes Analisados", value: "4" },
    { label: "Taxa de Risco Alto", value: "50%" },
    { label: "Idade Média", value: "40.5 anos" },
    { label: "Colesterol Médio", value: "207.5 mg/dL" },
  ];

  return (
    <div className="bg-secondary p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-primary">
        Resumo da Análise de Risco Cardíaco
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-primary p-4 rounded-lg text-center">
            <p className="text-sm text-muted mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-accent">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
