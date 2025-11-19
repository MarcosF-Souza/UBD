import React from "react";

export default function Sidebar() {
  return (
    <aside className="sidebar sticky flex-col bg-gray-950 text-white w-64 p-6 hidden md:flex">
      <nav className="">
        <h2 className="text-2xl font-bold mb-4">Sidebar</h2>
        <ul className="space-y-2">
          <li>
            <a
              href="#home"
              className="block py-2 px-3 rounded hover:bg-gray-800 transition-colors"
            >
              🏠 Início
            </a>
          </li>
          <li>
            <a
              href="#energia"
              className="block py-2 px-3 rounded hover:bg-gray-800 transition-colors"
            >
              ⚡ Energia Solar
            </a>
          </li>
          <li>
            <a
              href="#saude"
              className="block py-2 px-3 rounded hover:bg-gray-800 transition-colors"
            >
              🏥 Saúde Cardíaca
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
