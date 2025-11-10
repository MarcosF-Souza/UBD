import React from "react";
import FlashOnIcon from "../../assets/icons/flash_on.svg";
import HeartIcon from "../../assets/icons/heart.svg";
import { Link } from "react-router-dom";

export default function Dashboards() {
  return (
    <section
      className="flex flex-col justify-center items-center w-full px-6 py-20 bg-black gap-6"
      id="dashboards"
    >
      <h2 className="text-3xl font-bold text-white">Dashboards Interativos</h2>

      <p className="text-xl text-gray-300 mb-4 text-center max-w-xl">
        Explore as visualizações interativas dos nossos minimundos através dos
        dashboards desenvolvidos.
      </p>

      <div className="flex flex-col justify-center w-full md:grid md:grid-cols-2 gap-6 max-w-xl mx-auto">
        <DashboardCard
          icon={FlashOnIcon}
          title="Painéis Solares"
          link="/energia"
          color="from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        />
        <DashboardCard
          icon={HeartIcon}
          title="Saúde"
          link="/saude"
          color="from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
        />
      </div>
    </section>
  );
}

function DashboardCard({ icon, title, link, color }) {
  return (
    <Link to={link}>
      <article
        className={`flex flex-col justify-center items-center bg-gradient-to-r ${color} p-6 rounded-lg shadow-md text-white gap-3 hover:scale-105 focus:scale-105 transition-transform`}
        tabIndex={0}
      >
        <span>
          <img src={icon} alt={title} className="w-12 h-12" />
        </span>
        <h3 className="text-2xl font-semibold">{title}</h3>
      </article>
    </Link>
  );
}
