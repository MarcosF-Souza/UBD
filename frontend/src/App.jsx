import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./app.css";

/* Layout */
import BottomNavigationBar from "./components/layout/BottomNavigationBar";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";

/* Páginas */
import ScrollToTop from "./components/ScrollToTop";
import { ThemeProvider } from "./contexts/ThemeContext";
import Energia from "./pages/Energia";
import Home from "./pages/Home";
import Saude from "./pages/Saude";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <div className="">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/energia" element={<Energia />} />
                <Route path="/saude" element={<Saude />} />
              </Routes>
            </div>
            <BottomNavigationBar />
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;