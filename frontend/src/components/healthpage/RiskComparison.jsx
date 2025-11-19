export default function RiskComparison() {
  const comparisonData = [
    {
      metric: "Idade Média",
      baixoRisco: "33.5 anos",
      altoRisco: "47.5 anos",
      diferenca: "+14.0 anos",
    },
    {
      metric: "Colesterol Médio",
      baixoRisco: "175.0 mg/dL",
      altoRisco: "240.0 mg/dL",
      diferenca: "+65.0 mg/dL",
    },
    {
      metric: "Pressão Média",
      baixoRisco: "117.5 mmHg",
      altoRisco: "147.5 mmHg",
      diferenca: "+30.0 mmHg",
    },
  ];

  return (
    <div className="bg-secondary p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-primary">
        Comparação: Risco Baixo vs Alto
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="pb-3 text-primary">Métrica</th>
              <th className="pb-3 text-green-500">Risco Baixo (n=2)</th>
              <th className="pb-3 text-red-500">Risco Alto (n=2)</th>
              <th className="pb-3 text-accent">Diferença</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row, index) => (
              <tr key={index} className="border-b border-gray-800">
                <td className="py-3 text-muted">{row.metric}</td>
                <td className="py-3 text-green-400">{row.baixoRisco}</td>
                <td className="py-3 text-red-400">{row.altoRisco}</td>
                <td className="py-3 text-accent font-semibold">
                  {row.diferenca}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
