import React, { useEffect, useState } from "react";
import { useTheme } from "./ThemeContext";
import FlipCardAgente from "./FlipCardAgente";
import SidebarDetalhes from "./SidebarDetalhes";
import './DashboardAgentes.css';

export default function DashboardAgentes() {
  const { tema } = useTheme();
  const [dados, setDados] = useState([]);
  const [erro, setErro] = useState(null);
  const [agenteSelecionado, setAgenteSelecionado] = useState(null);
  const [alertasMatricula, setAlertasMatricula] = useState([]);
  const [mostrarSidebarAlertas, setMostrarSidebarAlertas] = useState(false);

  useEffect(() => {
    fetch("https://api.sheetbest.com/sheets/f6d72757-6186-4c31-a811-3295c2e79eeb/tabs/Onboarding%20Maio")
      .then((res) => res.json())
      .then((data) => {
        const naoAtivos = [
          "inválido",
          "inacessível",
          "desconhece aluno",
          "chargeback",
          "cancelado antes",
          "caso auditoria",
        ];

        const hoje = new Date();
        const alunos6ou7Dias = data.filter((aluno) => {
          const dataMatricula = aluno["DATA MAT"]?.trim();
          if (!dataMatricula) return false;
          const [dia, mes, ano] = dataMatricula.split("/");
          const data = new Date(`${ano}-${mes}-${dia}`);
          const diff = Math.floor((hoje - data) / (1000 * 60 * 60 * 24));
          return diff === 6 || diff === 7;
        });
        setAlertasMatricula(alunos6ou7Dias);

        const agrupado = {};
        data.forEach((item) => {
          const agente = item["AGENTE"]?.trim();
          const status = item["STATUS"]?.trim().toLowerCase();
          const foto = `/fotos/${agente}.jpg`;
          if (!agente || !status) return;

          if (!agrupado[agente]) {
            agrupado[agente] = {
              agente,
              foto,
              total: 0,
              ativos: 0,
              resolvidos: 0,
              statusDetalhado: {},
              alunos: [],
            };
          }

          agrupado[agente].total++;
          if (!naoAtivos.includes(status)) agrupado[agente].ativos++;
          if (status === "resolvido") agrupado[agente].resolvidos++;

          if (!agrupado[agente].statusDetalhado[status]) {
            agrupado[agente].statusDetalhado[status] = 1;
          } else {
            agrupado[agente].statusDetalhado[status]++;
          }

          agrupado[agente].alunos.push({
            nome: item["ALUNO"]?.trim(),
            status,
            dia: item["DIA DA AULA ZERO"]?.trim(),
            dataMatricula: item["DATA MAT"]?.trim(),
            telefone: item["TELEFONE"]?.trim() || "Não informado",
          });
        });

        const resultado = Object.values(agrupado).map((ag) => ({
          ...ag,
          pctCheia: ag.total ? ((ag.resolvidos / ag.total) * 100).toFixed(2) : "0.00",
          pctAtiva: ag.ativos ? ((ag.resolvidos / ag.ativos) * 100).toFixed(2) : "0.00",
        }));

        setDados(resultado);
      })
      .catch((err) => {
        console.error("Erro ao carregar dados", err);
        setErro("Erro ao carregar dados.");
      });
  }, []);

  const topAproveitamento = [...dados].sort((a, b) => b.pctAtiva - a.pctAtiva).slice(0, 2);
  const topResolvidos = [...dados].sort((a, b) => b.resolvidos - a.resolvidos).slice(0, 2);
  const topAtivos = [...dados].sort((a, b) => b.ativos - a.ativos).slice(0, 2);

  return (
    <div className={`container ${tema === "escuro" ? "escuro" : "claro"}`}>
      <div className="header-topo">
        <h1 className="titulo">Ranking de Performance</h1>

        {alertasMatricula.length > 0 && (
          <div
            className="alerta-botao piscar"
            title="Alunos com 6 ou 7 dias de matrícula"
            onClick={() => setMostrarSidebarAlertas(true)}
          >
            ⚠️
          </div>
        )}
      </div>

      <div className="ranking-trio-linha">
        {/* Aproveitamento */}
        <div className="bloco-ranking">
          <h2 className="ranking-titulo-grande">
            Melhor Aproveitamento <span className="tooltip-icon" title="Porcentagem de alunos resolvidos em relação ao total da carteira — considerando todos os alunos, inclusive os inativos ou inválidos.">❔</span>
          </h2>
          <div className="ranking-dupla">
            {topAproveitamento.map((ag, i) => (
              <div className="card-individual-ranking" key={ag.agente}>
                <img src={ag.foto} className="avatar-pequeno" alt={ag.agente} />
                <div className="nome-ranking">{i === 0 ? "🥇" : "🥈"} {ag.agente}</div>
                <div className="valor-ranking destaque-verde">{ag.pctCheia}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Resolvidos */}
        <div className="bloco-ranking">
          <h2 className="ranking-titulo-grande">
            Mais Resolvidos <span className="tooltip-icon" title="Quantidade total de aulas zero realizadas.">❔</span>
          </h2>
          <div className="ranking-dupla">
            {topResolvidos.map((ag, i) => (
              <div className="card-individual-ranking" key={ag.agente}>
                <img src={ag.foto} className="avatar-pequeno" alt={ag.agente} />
                <div className="nome-ranking">{i === 0 ? "🥇" : "🥈"} {ag.agente}</div>
                <div className="valor-ranking destaque-verde">{ag.resolvidos} alunos</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ativos */}
        <div className="bloco-ranking">
          <h2 className="ranking-titulo-grande">
            Somente Ativos <span className="tooltip-icon" title="Porcentagem de alunos resolvidos considerando apenas os ativos. Casos inválidos, inacessíveis, cancelados antes, com auditoria ou situações atípicas são desconsiderados.">❔</span>
          </h2>
          <div className="ranking-dupla">
            {topAtivos.map((ag, i) => (
              <div className="card-individual-ranking" key={ag.agente}>
                <img src={ag.foto} className="avatar-pequeno" alt={ag.agente} />
                <div className="nome-ranking">{i === 0 ? "🥇" : "🥈"} {ag.agente}</div>
                <div className="valor-ranking destaque-verde">{ag.pctAtiva}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="linha-horizontal"></div>
      <h1 className="titulo">Análise por Agente</h1>

      <div className="dashboard-agentes-container">
        {dados.map((agente) => (
          <FlipCardAgente
            key={agente.agente}
            agente={agente}
            onClick={() => setAgenteSelecionado(agente)}
          />
        ))}
      </div>

      {agenteSelecionado && (
        <SidebarDetalhes
          agente={agenteSelecionado}
          onClose={() => setAgenteSelecionado(null)}
          rankingGeral={dados}
        />
      )}

      {mostrarSidebarAlertas && (
        <div className="alerta-overlay" onClick={() => setMostrarSidebarAlertas(false)}>
          <div className="alerta-sidebar" onClick={(e) => e.stopPropagation()}>
            <button className="fechar-alerta" onClick={() => setMostrarSidebarAlertas(false)}>✖</button>
            <h3>⚠️ Matrículas com 6 ou 7 dias</h3>
            <ul>
              {alertasMatricula.map((aluno, index) => (
                <li key={index}>
                  <strong>{aluno["ALUNO"]}</strong><br />
                  📞 {aluno["TELEFONE"] || "Sem telefone"}<br />
                  📅 {aluno["DATA MAT"]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
// ajuste forçado para redeploy