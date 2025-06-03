import React from "react";
import "./VisaoMensal.css";

export default function VisaoMensal({ agendamentos, aoClicarNoDia }) {
  // Função para obter todos os dias do mês atual
  const gerarDiasDoMes = () => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth(); // 0 = janeiro
    const dias = [];

    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);

    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const dataStr = `${String(dia).padStart(2, "0")}/${String(mes + 1).padStart(2, "0")}/${ano}`;

      const agendamentosDoDia = agendamentos.filter((a) => a.dia === dataStr);
      const agentesNoDia = {};

      agendamentosDoDia.forEach((a) => {
        if (!agentesNoDia[a.agente]) agentesNoDia[a.agente] = [];
        agentesNoDia[a.agente].push(a);
      });

      dias.push({
        dataStr,
        numero: dia,
        agentes: agentesNoDia
      });
    }

    return dias;
  };

  const diasDoMes = gerarDiasDoMes();

  return (
    <div className="grade-mensal">
      {diasDoMes.map((dia) => {
        const totalAgendamentos = Object.values(dia.agentes).reduce(
          (soma, ags) => soma + ags.length,
          0
        );

        return (
          <div key={dia.dataStr} className="bloco-dia">
            <div className="cabecalho-dia">Dia {dia.numero}</div>

            <div className="conteudo-central-dia">
              <div className="agentes-dia">
                {Object.entries(dia.agentes).map(([agente, agendamentos]) => (
                  <div
                    key={agente}
                    className="foto-agente-mini"
                    onClick={() => aoClicarNoDia(dia.dataStr, agente)}
 title={`Agente: ${agente}\nTotal de agendamentos: ${agendamentos.length}`}
                  >
                    <img src={`/fotos/${agente}.jpg`} alt={agente} />
                  </div>
                ))}
              </div>
            </div>

            <div className="rodape-total">
              Total: {totalAgendamentos}
            </div>
          </div>
        );
      })}
    </div>
  );
}