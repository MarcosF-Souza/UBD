import React from "react";
import PainelSolarImg from "../../assets/images/painel-solar.jpg";
import CardiacImg from "../../assets/images/cardiac.jpg";
import Button from "../ui/Button";

export default function Minimundos() {
  const miniWorlds = [
    {
      title: "Minimundo 13",
      subtitle: "Análise de Eficiência de Painéis Solares",
      description:
        "Análise do desempenho de painéis solares com base na temperatura e radiação solar, incluindo cálculo de rendimento médio por hora, gráficos de dispersão e mapas de calor.",
      url: "https://github.com/toddync/UBD/blob/main/13.ipynb",
      imageUrl: PainelSolarImg,
      titleColor: "text-blue-400",
      buttonStyle:
        "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white",
    },
    {
      title: "Minimundo 15",
      subtitle: "Análise de Risco Cardíaco",
      description:
        "Predição de risco cardíaco em pacientes baseada em fatores como pressão arterial, colesterol e idade, com análise de correlação entre variáveis e visualizações detalhadas.",
      url: "https://github.com/toddync/UBD/blob/main/15.ipynb",
      imageUrl: CardiacImg,
      titleColor: "text-purple-400",
      buttonStyle:
        "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white",
    },
  ];

  return (
    <section
      className="flex flex-col items-center w-full px-6 py-20 bg-gray-900 md:h-auto gap-8"
      id="minimundos"
    >
      <h2 className="text-3xl font-bold text-white">Minimundos</h2>

      <div className="flex flex-col items-center w-full gap-8 md:grid md:grid-cols-2 max-w-5xl mx-auto">
        {miniWorlds.map((miniWorld, index) => (
          <MiniWorldCard
            key={index}
            title={miniWorld.title}
            subtitle={miniWorld.subtitle}
            description={miniWorld.description}
            imageUrl={miniWorld.imageUrl}
            demoUrl={miniWorld.url}
            titleColor={miniWorld.titleColor}
            buttonStyle={miniWorld.buttonStyle}
          />
        ))}
      </div>
    </section>
  );
}

function MiniWorldCard({
  title,
  subtitle,
  description,
  imageUrl,
  demoUrl,
  buttonStyle,
  titleColor,
}) {
  return (
    <article className="flex flex-col justify-between gap-4 bg-gray-800 rounded-lg shadow-lg overflow-hidden p-6 w-full h-full">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-48 object-cover mb-3"
      />
      <h3 className={`text-2xl font-bold mb-2 ${titleColor}`}>{title}</h3>
      <p className="text-gray-50 font-semibold text-xl">{subtitle}</p>

      <p className="text-gray-300 mb-3">{description}</p>

      <Button
        title="Ver Notebook 💻"
        style={`${buttonStyle} font-semibold p-4 rounded-lg`}
        onClick={() => window.open(demoUrl, "_blank")}
      />
    </article>
  );
}
