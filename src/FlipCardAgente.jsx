import React from "react";
import "./App.css";

export default function FlipCardAgente({ agente, onClick }) {
  return (
    <div className="flip-card" onClick={onClick}>
      <div className="flip-inner">
        <div className="flip-front">
          <img src={agente.foto} alt={agente.agente} className="avatar" />
          <h3>{agente.agente}</h3>
          <div className="barras-progresso">
            <div className="barra barra-roxa" style={{ width: agente.pctCheia + "%" }}></div>
            <div className="barra barra-verde" style={{ width: agente.pctAtiva + "%" }}></div>
          </div>
          <div className="porcentagens-coloridas">
            <span className="badge-roxa">{agente.pctCheia}% Cheia</span>
            <span className="badge-verde">{agente.pctAtiva}% Ativa</span>
          </div>
        </div>

        <div className="flip-back">
          <h4>Status:</h4>
          <ul>
            {Object.entries(agente.statusDetalhado).map(([status, qtd]) => (
              <li key={status}><strong>{status}</strong>: {qtd}</li>
            ))}
          </ul>
          <button className="ver-mais">Ver mais detalhes</button>
        </div>
      </div>
    </div>
  );
}