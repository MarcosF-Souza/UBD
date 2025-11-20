import React from "react";

export default function HealthScatter() {
  return (
    <article className="bg-tertiary p-6 rounded-lg health__scatter">
      <h3 className="text-xl font-medium text-center">Colesterol x Pressão Arterial</h3>
      <div className="flex flex-col h-full justify-center items-center gap-2 p-4">
        <span className="text-4xl">📊</span>
        <p className="text-muted text-center">
          Gráfico de dispersão será exibido aqui
        </p>
      </div>
    </article>
  );
}
