import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Componente que rola a página para o topo sempre que a rota mudar
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
}
