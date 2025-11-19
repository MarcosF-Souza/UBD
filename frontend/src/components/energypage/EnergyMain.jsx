import React from "react";
import EnergyAveragePerHour from "./EnergyAveragePerHour";
import EnergyScatter from "./EnergyScatter";
import EnergyHeatMap from "./EnergyHeatMap";

export default function EnergyMain() {
  return (
    <section className="grid grid-cols-1 auto-rows-auto bg-secondary p-6 rounded-lg gap-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Métricas Principais</h2>
        <p className="text-muted text-sm">
          Análise de rendimento dos painéis solares ao longo do dia
        </p>
      </div>

      <div className="energy__main gap-4">
        <EnergyAveragePerHour />
        <EnergyScatter />
        <EnergyHeatMap />
      </div>
    </section>
  );
}
