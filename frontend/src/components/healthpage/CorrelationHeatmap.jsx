export default function CorrelationHeatmap() {
  const correlationData = [
    { var1: "Idade", var2: "Colesterol", value: 0.939 },
    { var1: "Idade", var2: "Pressão", value: 0.992 },
    { var1: "Idade", var2: "Risco", value: 0.887 },
    { var1: "Colesterol", var2: "Pressão", value: 0.973 },
    { var1: "Colesterol", var2: "Risco", value: 0.912 },
    { var1: "Pressão", var2: "Risco", value: 0.894 },
  ];

  const getColorClass = (value) => {
    if (value >= 0.95) return "bg-red-600";
    if (value >= 0.9) return "bg-orange-500";
    if (value >= 0.85) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="bg-secondary p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-primary">
        Mapa de Calor - Correlação entre Variáveis
      </h2>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-2 gap-2 min-w-max">
          {correlationData.map((item, index) => (
            <div
              key={index}
              className={`${getColorClass(
                item.value
              )} p-4 rounded-lg text-white`}
            >
              <p className="text-sm font-semibold">
                {item.var1} × {item.var2}
              </p>
              <p className="text-2xl font-bold">{item.value.toFixed(3)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-muted">≥ 0.95</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-muted">0.90-0.95</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-muted">0.85-0.90</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-muted">\u003c 0.85</span>
          </div>
        </div>
      </div>
    </div>
  );
}
