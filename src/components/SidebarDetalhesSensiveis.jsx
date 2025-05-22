import React from "react";
import "./SidebarDetalhesSensiveis.css";

export default function SidebarDetalhesSensiveis({ status, alunos, onClose }) {
  const handleClickFora = (e) => {
    if (e.target.className === "fundo-sensivel") {
      onClose();
    }
  };

  return (
    <div className="fundo-sensivel" onClick={handleClickFora}>
      <div className="sidebar-sensiveis">
        <h2>{status.charAt(0).toUpperCase() + status.slice(1)} - {alunos.length} alunos</h2>

        <div className="lista-alunos">
          {alunos.map((aluno, index) => (
            <div className="card-aluno" key={index}>
              <p><strong>Nome:</strong> {aluno.nome}</p>
              <p><strong>Email:</strong> {aluno.email}</p>
              <p><strong>Telefone:</strong> {aluno.telefone || "Não informado"}</p>
              <p><strong>Matrícula:</strong> {aluno.dataMatricula}</p>
              <p><strong>Comercial:</strong> {aluno.comercial || "Não informado"}</p>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="botao-fechar-sensivel">Fechar</button>
      </div>
    </div>
  );
}
