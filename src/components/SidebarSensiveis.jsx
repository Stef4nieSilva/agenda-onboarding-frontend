import React from "react";
import "./SidebarSensiveis.css";

export default function SidebarSensiveis({ status, alunos, onClose }) {
  const alunosFiltrados = alunos.filter((a) => a.status === status);

  return (
    <div className="sidebar-sensiveis">
      <h2>{status.charAt(0).toUpperCase() + status.slice(1)}</h2>
      {alunosFiltrados.length === 0 ? (
        <p>Nenhum aluno encontrado com este status.</p>
      ) : (
        alunosFiltrados.map((a, idx) => (
          <div key={idx} className="card-aluno">
            <p><strong>Nome:</strong> {a.nome}</p>
            <p><strong>Email:</strong> {a.email}</p>
            <p><strong>Telefone:</strong> {a.telefone}</p>
            <p><strong>Matrícula:</strong> {a.dataMatricula}</p>
            <p><strong>Comercial:</strong> {a.comercial}</p>
          </div>
        ))
      )}
      <button className="botao-fechar" onClick={onClose}>Fechar</button>
    </div>
  );
}
