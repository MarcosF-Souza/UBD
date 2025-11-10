import React from "react";

export default function Members() {
  const members = [
    { name: "Daniel Gomes", role: "Desenvolvedor Backend" },
    { name: "Davy Andrade", role: "Desenvolvedor Frontend" },
    { name: "Fellype Samuel", role: "Documentação e Fullstack" },
    { name: "Gabriel Teixeira", role: "Desenvolvedor Backend" },
    { name: "Marcos Ferreira", role: "Desenvolvedor Frontend" },
  ];

  return (
    <section
      className="flex flex-col items-center w-full py-20 text-white bg-gray-900 max-w-4xl mx-auto"
      id="membros"
    >
      <h2 className="text-3xl font-bold mb-8">Integrantes</h2>

      <div className="flex flex-wrap justify-center">
        {members.map((member, index) => (
          <MemberCard key={index} name={member.name} role={member.role} />
        ))}
      </div>
    </section>
  );
}

function MemberCard({ name, role }) {
  return (
    <div
      className="bg-gray-800 rounded-lg p-6 m-4 w-64 text-center transform hover:scale-105 focus:scale-105 transition-transform"
      tabIndex={0}
    >
      <h3 className="text-xl font-semibold mb-2">{name}</h3>
      <p className="text-gray-400">{role}</p>
    </div>
  );
}
