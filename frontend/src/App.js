// App.js (Refactored with Improved Structure)
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { PelotonDashboardProvider } from "./contexts/PelotonContext";
import Dashboard from "./components/Dashboard";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <PelotonDashboardProvider>
        <Header />
        <Dashboard />
        <Footer />
      </PelotonDashboardProvider>
    </div>
  );
}
