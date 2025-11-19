import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HomeIcon from "../../assets/icons/home.svg";
import FlashOnIcon from "../../assets/icons/flash_on.svg";
import HeartIcon from "../../assets/icons/heart.svg";

export default function BottomNavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { id: 0, icon: HomeIcon, label: "Início", path: "/" },
    { id: 1, icon: FlashOnIcon, label: "Energia", path: "/energia" },
    { id: 2, icon: HeartIcon, label: "Saúde", path: "/saude" },
  ];

  const handleTabClick = (path) => {
    navigate(path);
  };

  // Função para verificar se a rota está ativa
  const isActiveRoute = (path) => {
    if (path === "/" && location.pathname === "/") {
      return true;
    }
    return path !== "/" && location.pathname.startsWith(path);
  };

  return (
    <nav className="flex justify-around md:justify-evenly h-16 items-center sticky bottom-0 left-0 w-full bg-gray-950/95 backdrop-blur-md px-6 py-4 text-white lg:hidden z-50 border-t border-gray-800">
      {navigationItems.map((item) => (
        <NavigationItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          isActive={isActiveRoute(item.path)}
          onClick={() => handleTabClick(item.path)}
        />
      ))}
    </nav>
  );
}

function NavigationItem({ icon, label, isActive, onClick }) {
  return (
    <button
      className={`flex flex-col justify-center items-center rounded-lg transition-all duration-300 px-6 py-1 ${
        isActive
          ? "text-blue-400 bg-blue-500/10 scale-105"
          : "text-gray-300 hover:text-white hover:bg-gray-800/50"
      }`}
      onClick={onClick}
    >
      <div
        className={`w-6 h-6 mb-1 transition-transform duration-300 ${
          isActive ? "scale-110" : ""
        }`}
      >
        <img
          src={icon}
          alt={label}
          className={`${isActive ? "filter brightness-110" : ""}`}
          style={{
            filter: isActive
              ? "brightness(0) saturate(100%) invert(68%) sepia(100%) saturate(1000%) hue-rotate(180deg) brightness(100%) contrast(101%)"
              : "brightness(0) saturate(100%) invert(100%)",
          }}
        />
      </div>
      <span
        className={`text-xs font-medium transition-colors duration-300 ${
          isActive ? "text-blue-400" : "text-gray-300"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
