import EnergyAveragePerHour from "../components/energypage/EnergyAveragePerHour";
import EnergyEfficiencyByHour from "../components/energypage/EnergyEfficiencyByHour";
import EnergyEvolution from "../components/energypage/EnergyEvolution";
import EnergySummary from "../components/energypage/EnergySummary";
import EnergyTempPot from "../components/energypage/EnergyTempPot";

export default function Energia() {
  return (
    <main className="flex flex-col bg-primary px-6 pt-20 pb-10 gap-4 text-primary">
      <h1 className="text-3xl font-bold">Painéis Solares</h1>
      <p className="text-muted mb-4">
        Análise de eficiência energética baseada em temperatura e radiação
        solar.
      </p>

      <div className="grid auto-rows-auto gap-6">
        <EnergySummary />
        <EnergyAveragePerHour />
        <EnergyTempPot />
        <EnergyEfficiencyByHour />
        <EnergyEvolution />
      </div>
    </main>
  );
}
