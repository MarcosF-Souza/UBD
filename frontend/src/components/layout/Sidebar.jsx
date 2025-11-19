import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import DarkModeIcon from "../../assets/icons/dark-mode.svg";
import FlashOnIcon from "../../assets/icons/flash_on.svg";
import HeartIcon from "../../assets/icons/heart.svg";
import HomeIcon from "../../assets/icons/home.svg";
import LightModeIcon from "../../assets/icons/light-mode.svg";
import { useTheme } from "../../hooks/useTheme";

export default function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    { id: 0, icon: HomeIcon, label: "Início", path: "/" },
    { id: 1, icon: FlashOnIcon, label: "Energia", path: "/energia" },
    { id: 2, icon: HeartIcon, label: "Saúde", path: "/saude" },
  ];

  const isActiveRoute = (path) => {
    if (path === "/" && location.pathname === "/") {
      return true;
    }
    return path !== "/" && location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen sticky top-0 bg-gray-950 text-white border-r border-gray-800 shrink-0 transition-all duration-300 ${
        isCollapsed ? "w-20 p-4" : "w-72 p-6"
      }`}
    >
      <div className="mb-8 flex items-center justify-between">
        {!isCollapsed && (
          <Link
            to="/"
            className="font-bold text-2xl bg-linear-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent block whitespace-nowrap overflow-hidden max-w-xs"
          >
            AV2 UBD
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors ${
            isCollapsed ? "mx-auto" : ""
          }`}
          title={isCollapsed ? "Expandir" : "Recolher"}
        >
          {isCollapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15l-7.5-7.5 7.5-7.5"
              />
            </svg>
          )}
        </button>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 ${
                  isActiveRoute(item.path)
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.label : ""}
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  className="w-6 h-6 shrink-0"
                  style={{
                    filter: isActiveRoute(item.path)
                      ? "brightness(0) saturate(100%) invert(68%) sepia(100%) saturate(1000%) hue-rotate(180deg) brightness(100%) contrast(101%)"
                      : "brightness(0) saturate(100%) invert(100%)",
                  }}
                />
                {!isCollapsed && (
                  <span className="font-medium whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="pt-6 border-t border-gray-800">
        <ThemeToggle isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
}

function ThemeToggle({ isCollapsed }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-3 px-3 py-3 w-full rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
        isCollapsed ? "justify-center" : ""
      }`}
      title={`Alternar para ${isDark ? "Light Theme" : "Dark Theme"}`}
    >
      <img
        src={isDark ? DarkModeIcon : LightModeIcon}
        alt={isDark ? "Dark Mode" : "Light Mode"}
        className="w-6 h-6 shrink-0"
      />
      {!isCollapsed && (
        <span className="font-medium whitespace-nowrap overflow-hidden">
          {isDark ? "Dark Theme" : "Light Theme"}
        </span>
      )}
    </button>
  );
}
