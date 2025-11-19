export default function PredictiveModel() {
  const features = [
    { name: "Colesterol", importance: 0.592, color: "bg-purple-500" },
    { name: "Pressão", importance: 0.543, color: "bg-blue-500" },
    { name: "Idade", importance: 0.542, color: "bg-green-500" },
  ];

  return (
    <div className="bg-secondary p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-primary">
        Modelo Preditivo - Importância das Variáveis
      </h2>
      <p className="text-muted mb-6">
        Coeficientes do modelo de predição de risco cardíaco
      </p>
      <div className="space-y-4">
        {features.map((feature, index) => (
          <div key={index}>
            <div className="flex justify-between mb-2">
              <span className="text-primary font-semibold">{feature.name}</span>
              <span className="text-accent">
                {feature.importance.toFixed(3)}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className={`${feature.color} h-full rounded-full transition-all duration-500`}
                style={{ width: `${feature.importance * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 bg-primary rounded-lg">
        <p className="text-sm text-muted">
          <span className="font-semibold text-accent">Interpretação:</span> O
          colesterol apresenta a maior importância no modelo preditivo, seguido
          pela pressão arterial e idade. Todas as variáveis mostram forte
          correlação com o risco cardíaco.
        </p>
      </div>
    </div>
  );
}
