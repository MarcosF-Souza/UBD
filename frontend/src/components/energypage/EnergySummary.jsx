import EnergyEvolution from "./EnergyEvolution";
import EnergyMetrics from "./EnergyMetrics";

export default function EnergySummary() {
  return (
    <section className="flex flex-col bg-secondary p-6 rounded-lg gap-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Outras Métricas</h2>
        <p className="text-muted text-sm">
          Estatísticas relevantes acerca dos dados
        </p>
      </div>

      <div className="energy__secondary">
        <EnergyMetrics />
        <EnergyEvolution />
      </div>
    </section>
  );
}
