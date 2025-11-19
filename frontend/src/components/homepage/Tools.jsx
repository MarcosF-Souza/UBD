import React from "react";
import PythonIcon from "../../assets/icons/python.svg";
import DjangoIcon from "../../assets/icons/django.svg";
import PandasIcon from "../../assets/icons/pandas.svg";
import MatplotlibIcon from "../../assets/icons/matplotlib.svg";
import SeabornIcon from "../../assets/icons/seaborn.svg";
import ScikitLearnIcon from "../../assets/icons/scikit-learn.svg";
import ReactIcon from "../../assets/icons/react.svg";
import TailwindIcon from "../../assets/icons/tailwind.svg";
import ViteIcon from "../../assets/icons/vite.svg";
import JupyterIcon from "../../assets/icons/jupyter.svg";
import CsvIcon from "../../assets/icons/csv.svg";

export default function Tools() {
  const backendTools = [
    { name: "Python", icon: PythonIcon },
    { name: "Django", icon: DjangoIcon },
    { name: "Pandas", icon: PandasIcon },
    { name: "Matplotlib", icon: MatplotlibIcon },
    { name: "Seaborn", icon: SeabornIcon },
    { name: "Scikit-learn", icon: ScikitLearnIcon },
  ];

  const frontendTools = [
    { name: "React", icon: ReactIcon },
    { name: "Tailwind CSS", icon: TailwindIcon },
    { name: "Vite", icon: ViteIcon },
  ];

  const dataTools = [
    { name: "Jupyter Notebook", icon: JupyterIcon },
    { name: "CSV", icon: CsvIcon },
  ];

  return (
    <section
      className="flex flex-col items-center min-h-screen w-full px-6 py-20 bg-secondary"
      id="ferramentas"
    >
      <h2 className="text-3xl font-bold mb-8 text-left w-full md:text-center text-primary">
        Ferramentas Utilizadas
      </h2>

      <div className="flex flex-col w-full gap-8 max-w-4xl xl:max-w-5xl mx-auto">
        <ToolBox
          name="Backend"
          titleColor="text-blue-400"
          toolList={backendTools}
        />
        <ToolBox
          name="Frontend"
          titleColor="text-purple-400"
          toolList={frontendTools}
        />
        <ToolBox
          name="Manipulação de Dados"
          titleColor="text-green-400"
          toolList={dataTools}
        />
      </div>
    </section>
  );
}

function ToolBox({ name, titleColor, toolList }) {
  return (
    <article className="flex flex-col w-full gap-4">
      <h3 className={`text-2xl font-medium ${titleColor}`}>{name}</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {toolList.map((item, index) => (
          <ToolItem key={index} icon={item.icon} name={item.name} />
        ))}
      </div>
    </article>
  );
}

function ToolItem({ icon, name }) {
  return (
    <div
      className="flex flex-col items-center gap-3 bg-tertiary rounded-lg p-4 lg:justify-center transform hover:scale-105 focus:scale-105 transition-transform"
      tabIndex={0}
    >
      <img src={icon} alt={`${name} icon`} className="w-10 h-10" />
      <span className="text-lg text-primary text-center">{name}</span>
    </div>
  );
}
