// src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Agenda from "./Agenda";
import Dashboard from "./Dashboard";
import BotaoTema from "./BotaoTema";
import { ThemeProvider, useTheme } from "./ThemeContext";
import "./App.css";
import DashboardAgentes from "./DashboardAgentes"; // importe o novo componente


function AppContent() {
  const { tema } = useTheme();

  // ✅ Adiciona a classe no <body>
  useEffect(() => {
    document.body.className = tema;
  }, [tema]);

  return (
    <div className={`container ${tema === "escuro" ? "escuro" : "claro"}`}>
      <Router>
        <BotaoTema />

        <div className="nav-topo">
          <Link to="/" className="botao-navegacao">Agenda</Link>
          <Link to="/dashboard" className="botao-navegacao">Dashboard Análise</Link>
          <Link to="/dashboard/agentes" className="botao-navegacao">Análise dos Agentes</Link>
        </div>

        {/* ROTAS */}
        <Routes>
          <Route path="/" element={<Agenda />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/agentes" element={<DashboardAgentes />} />
        </Routes>
      </Router>
    </div>
  );
}

// Exporta com o ThemeProvider (isso já estava certo no seu projeto)
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}