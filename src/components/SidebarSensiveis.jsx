// src/components/SidebarSensiveis.jsx
import React from "react";
import "./SidebarSensiveis.css";

export default function SidebarSensiveis({ status, alunos, onClose }) {
  // Se já vier filtrado, não precisa reencontrar. Se vier completo, filtra aqui:
  const alunosFiltrados = alunos.filter((a) => a.status === status);

  const handleClickFora = (e) => {
    if (e.target.classList.contains("fundo-sensivel")) {
      onClose();
    }
  };

  return (
    <div className="fundo-sensivel" onClick={handleClickFora}>
      <div className="sidebar-sensiveis" role="dialog" aria-modal="true" aria-labelledby="titulo-sensiveis">
        <h2 id="titulo-sensiveis">
          {status.charAt(0).toUpperCase() + status.slice(1)} – {alunosFiltrados.length} {alunosFiltrados.length === 1 ? "aluno" : "alunos"}
        </h2>

        {alunosFiltrados.length === 0 ? (
          <p>Nenhum aluno encontrado com este status.</p>
        ) : (
          <div className="lista-alunos">
            {alunosFiltrados.map((a, idx) => (
              <div key={idx} className="card-aluno">
                <p><strong>Nome:</strong> {a.nome}</p>
                <p><strong>Email:</strong> {a.email}</p>
                <p><strong>Telefone:</strong> {a.telefone || "Não informado"}</p>
                <p><strong>Matrícula:</strong> {a.dataMatricula}</p>
                <p><strong>Comercial:</strong> {a.comercial || "Não informado"}</p>
              </div>
            ))}
          </div>
        )}

        <button onClick={onClose} className="botao-fechar-sensivel">Fechar</button>
      </div>
    </div>
  );
}
