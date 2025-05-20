import React from "react";

export default function GradeHorariosDia({ agentes, agendamentos, setAlunoSelecionado, horarios }) {
  const colunas = agentes.length + 1;

  const gridStyle = {
    gridTemplateColumns: `80px repeat(${agentes.length}, 1fr)`
  };

  return (
    <div className="grade-horarios-dia" style={gridStyle}>
      <div className="hora-bloco">Horário</div>
      {agentes.map((agente) => (
        <div key={agente} className="hora-bloco">{agente}</div>
      ))}

      {horarios.map((horario) => (
        <React.Fragment key={horario}>
          <div className="hora-bloco">{horario}</div>
          {agentes.map((agente) => {
            const agendamento = agendamentos.find(
              (a) => a.horario === horario && a.agente === agente
            );

            return (
              <div key={agente + horario} className="bloco-agente">
                {agendamento ? (
                  <div
                    className={`bloco-agente-conteudo ${agendamento.status === "resolvido" ? "resolvido" : ""}`}
                    onClick={() => setAlunoSelecionado(agendamento)}
                  >
                    <img
                      src={`/fotos/${agente}.jpg`}
                      alt={agente}
                      className="foto-agente-mini"
                      title={agendamento.nome}
                    />
                  </div>
                ) : (
                  <div className="bloco-agente-conteudo vazio" />
                )}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}
