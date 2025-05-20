// RankingCard.jsx
import React from "react";
import "./App.css";

export default function RankingCard({ agente, tipo, pos }) {
  const titulo = tipo === "aproveitamento"
    ? "Melhor Aproveitamento"
    : tipo === "resolvidos"
    ? "Mais Resolvidos"
    : "Mais Ativos";

  const valor = tipo === "aproveitamento"
    ? agente.pctAtiva + "%"
    : tipo === "resolvidos"
    ? agente.resolvidos + " alunos"
    : agente.ativos + " ativos";

  return (
    <div className="ranking-card">
      <div className="ranking-trofeu">{pos}</div>
      <img src={agente.foto} alt={agente.agente} className="ranking-avatar" />
      <h3>{agente.agente}</h3>
      <p className="ranking-titulo">{titulo}</p>
      <p className="ranking-valor">{valor}</p>
    </div>
  );
}