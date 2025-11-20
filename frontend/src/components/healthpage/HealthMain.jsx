import HealthCorrelation from "./HealthCorrelation";
import HealthHeatMap from "./HealthHeatMap";
import HealthScatter from "./HealthScatter";

export default function HealthMain() {
  return (
    <section className="grid grid-cols-1 auto-rows-auto bg-secondary p-6 rounded-lg gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">Métricas Principais</h2>
        <p className="text-muted text-sm">
          Estatísticas para previsão de risco cardíaco com base em pressão
          arterial, colesterol e idade.
        </p>
      </div>

      <div className="health__main gap-4">
        <HealthCorrelation />
        <HealthHeatMap />
        <HealthScatter />
      </div>
    </section>
  );
}
