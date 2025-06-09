import React from "react";

export default function GradeHorariosDia({
  agendamentos,
  agentes,
  setAlunoSelecionado,
  horarios,
  ausencias,
}) {
  const colunas = agentes.length + 1;

  const gridStyle = {
    gridTemplateColumns: `80px repeat(${agentes.length}, 1fr)`,
  };

  return (
    <div className="grade-horarios-dia" style={gridStyle}>
      <div className="hora-bloco">Horário</div>
      {agentes.map((agente) => (
        <div key={agente} className="hora-bloco">
          {agente}
        </div>
      ))}

      {horarios.map((horario) => (
        <React.Fragment key={horario}>
          <div className="hora-bloco">{horario}</div>
          {agentes.map((agente) => {
            const agendamento = agendamentos.find(
              (a) => a.horario === horario && a.agente === agente
            );

            const ausencia = ausencias[agente] || {};
            const {
              entrada,
              inicioIntervalo,
              fimIntervalo,
              fimExpediente,
            } = ausencia;

            const estaAusente =
              !entrada ||
              !fimExpediente ||
              horario < entrada ||
              (inicioIntervalo &&
                fimIntervalo &&
                horario >= inicioIntervalo &&
                horario < fimIntervalo) ||
              (fimExpediente && horario >= fimExpediente);

            return (
              <div key={agente + horario} className="bloco-agente">
                {estaAusente ? (
                  <div
                    className="bloco-agente-conteudo ausente"
                    title="Fora do expediente"
                  >
                    <span className="texto-ausente">Ausente</span>
                  </div>
                ) : agendamento ? (
                  <div
                    className={`bloco-agente-conteudo ${
                      agendamento.status === "resolvido"
                        ? "resolvido"
                        : agendamento.status === "agendado"
                        ? "agendado"
                        : ""
                    }`}
                    onClick={() => setAlunoSelecionado(agendamento)}
                    title={agendamento.nome}
                  >
                    <img
                      src={`/fotos/${agente}.jpg`}
                      alt={agente}
                      className="foto-agente-mini"
                    />
                  </div>
                ) : (
                  <div
                    className="bloco-agente-conteudo vazio"
                    title="Disponível"
                  />
                )}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}
