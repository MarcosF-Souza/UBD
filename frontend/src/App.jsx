import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./app.css";

/* Layout */
import BottomNavigationBar from "./components/layout/BottomNavigationBar";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";

/* Other components */
import ScrollToTop from "./components/ScrollToTop";
import { ThemeProvider } from "./contexts/ThemeContext";

/* Lazy-loaded Pages */
import { Suspense, lazy } from "react";

const Home = lazy(() => import("./pages/Home"));
const Energia = lazy(() => import("./pages/Energia"));
const Saude = lazy(() => import("./pages/Saude"));

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
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <p className="text-muted">Carregando...</p>
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/energia" element={<Energia />} />
                  <Route path="/saude" element={<Saude />} />
                </Routes>
              </Suspense>
            </div>
            <BottomNavigationBar />
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
