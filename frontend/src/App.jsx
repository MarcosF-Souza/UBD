import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./app.css";

/* Layout */
import BottomNavigationBar from "./components/layout/BottomNavigationBar";
import Header from "./components/layout/Header";

/* Páginas */
import { ThemeProvider } from "./contexts/ThemeContext";
import Energia from "./pages/Energia";
import Home from "./pages/Home";
import Saude from "./pages/Saude";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <Header />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/energia" element={<Energia />} />
          <Route path="/saude" element={<Saude />} />
        </Routes>

        <BottomNavigationBar />
      </Router>
    </ThemeProvider>
  );
}

export default App;