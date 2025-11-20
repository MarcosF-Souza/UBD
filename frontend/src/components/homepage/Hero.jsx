import Button from "../ui/Button";

export default function Hero() {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden w-full">
      {/* Background com blur */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-sm scale-110 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1635830625698-3b9bd74671ca?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=60&fm=webp&w=1332')`,
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/75 z-10" />

      {/* Conteúdo */}
      <div className="relative z-20 text-center text-white max-w-4xl px-6">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight bg-linear-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Segunda Avaliação de UBD
        </h1>

        <p className="text-xl md:text-2xl mb-8 opacity-90">
          Analisando a Eficiência de Painéis Solares e a Saúde Cardíaca
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button
            style="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition duration-300 transform hover:scale-105 focus:scale-105 focus:from-blue-600 shadow-lg"
            title="Ver Integrantes"
            onClick={() => scrollToSection("membros")}
          />

          <Button
            style="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold py-4 px-8 rounded-lg transition duration-300 transform hover:scale-105 focus:scale-105 focus:bg-white focus:text-gray-900 shadow-lg"
            title="Ferramentas Utilizadas"
            onClick={() => scrollToSection("ferramentas")}
          />
        </div>
      </div>
    </section>
  );
}
