import EnergyMain from "../components/energypage/EnergyMain";
import EnergySummary from "../components/energypage/EnergySummary";

export default function Energia() {
  return (
    <main className="flex flex-col bg-primary px-6 pt-20 pb-6 lg:py-6 gap-4 text-primary">
      <h1 className="text-3xl font-bold">Dashboard de Energia</h1>
      <p className="text-muted mb-4">
        Análise de eficiência energética baseada em temperatura e radiação
        solar.
      </p>

      <div className="grid gap-6">
        <EnergyMain />
        <EnergySummary />
      </div>
    </main>
  );
}
