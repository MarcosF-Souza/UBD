import LightModeIcon from "../../assets/icons/light-mode.svg";
import DarkModeIcon from "../../assets/icons/dark-mode.svg";
import { Link } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";

export default function Header() {
  return (
    <header className="flex justify-between md:px-20 items-center bg-gray-950 px-6 py-4 h-16 fixed top-0 left-0 w-full lg:hidden z-100 border-b border-gray-800">
      <Link
        to="/"
        className="font-bold text-lg bg-linear-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"
      >
        HEDA
      </Link>
      <ThemeToggle />
    </header>
  );
}

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="text-white">
      <img
        src={isDark ? DarkModeIcon : LightModeIcon}
        alt={isDark ? "Dark Mode" : "Light Mode"}
        className="h-6 w-6"
        title={`Mudar para tema ${isDark ? "claro" : "escuro"}`}
      />
    </button>
  );
}
