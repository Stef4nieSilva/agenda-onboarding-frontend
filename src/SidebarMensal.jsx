import React from "react";
import "./SidebarMensal.css";

export default function SidebarMensal({ dia, agente, agendamentos, onClose }) {
  const agendamentosFiltrados = agendamentos
    .filter((a) => a.dia === dia && a.agente === agente)
    .sort((a, b) => (a.horario || "").localeCompare(b.horario || ""));

  return (
    <div className="sidebar-mensal">
<h2 className="titulo-agente-data">{agente} – {dia}</h2>
      {agendamentosFiltrados.length === 0 ? (
        <p>Nenhum agendamento neste dia.</p>
      ) : (
        agendamentosFiltrados.map((a, index) => (
          <div key={index} className="item-agendamento">
            <p><strong>Aluno:</strong> {a.nome}</p>
            <p><strong>Horário:</strong> {a.horario}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={a.status === "resolvido" ? "status-resolvido" : "status-agendado"}
              >
                {a.status}
              </span>
            </p>
            <hr />
          </div>
        ))
      )}
      <button onClick={onClose} className="botao-fechar">Fechar</button>
    </div>
  );
}
