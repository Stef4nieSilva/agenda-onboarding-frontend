import { useEffect, useState } from "react";
import { useTheme } from "./ThemeContext";
import "./App.css";
import GaugeChart from "./components/GaugeChart";
import SidebarDetalhesSensiveis from "./components/SidebarDetalhesSensiveis";

export default function Dashboard() {
  const { tema } = useTheme();
  const [agendamentos, setAgendamentos] = useState([]);
  const [alertasMatricula, setAlertasMatricula] = useState([]);

  const [mostrarDetalhesSensiveis, setMostrarDetalhesSensiveis] = useState(false);
  const [alunosSensiveis, setAlunosSensiveis] = useState([]);
  const [statusSelecionado, setStatusSelecionado] = useState("");
  const [mostrarAnalise, setMostrarAnalise] = useState(false);
  const [comerciaisComProblemas, setComerciaisComProblemas] = useState([]);

  useEffect(() => {
    fetch("https://api.sheetbest.com/sheets/215bebce-f9fb-4299-a738-531a7b256f46/tabs/Onboarding%20Novembro")
      .then((res) => res.json())
      .then((data) => {
        const adaptado = data.map((item) => ({
          status: item["STATUS"]?.trim().toLowerCase(),
          email: item["EMAIL"]?.trim(),
          nome: item["ALUNO"]?.trim(),
          dataMatricula: item["DATA MAT"]?.trim(),
          telefone: item["TELEFONE"]?.trim(),
          comercial: item["COMERCIAL"]?.trim(),
        }));

        setAgendamentos(adaptado);

        // Filtrando os alunos com status críticos:
        const statusExcluidos = [
          "inválido",
          "inacessível",
          "desconhece aluno",
          "chargeback",
          "cancelado antes",
          "caso auditoria",
        ];

        const alunosComStatusCriticos = adaptado.filter((aluno) =>
          statusExcluidos.includes(aluno.status)
        );

        // Agrupando os alunos por comercial:
        const agrupamentoPorComercial = alunosComStatusCriticos.reduce((acc, aluno) => {
          const comercial = aluno.comercial || "Sem Comercial"; // Caso o comercial seja nulo ou indefinido
          if (!acc[comercial]) {
            acc[comercial] = 0;
          }
          acc[comercial]++;
          return acc;
        }, {});

        // Ordenando os comerciais e pegando os 5 primeiros:
        const topComerciais = Object.entries(agrupamentoPorComercial)
          .sort((a, b) => b[1] - a[1])  // Ordena do maior para o menor
          .slice(0, 5); // Pega os 5 comerciais mais problemáticos

        setComerciaisComProblemas(topComerciais);
      });
  }, []);

  // Restante da lógica de agendamentos e status
  const agendamentosValidos = agendamentos.filter((a) => a.email);
  const totalAlunos = agendamentosValidos.length;

  const statusExcluidos = [
    "inválido",
    "inacessível",
    "desconhece aluno",
    "chargeback",
    "cancelado antes",
    "caso auditoria",
  ];

  const totalNaoResolvidos = agendamentosValidos.filter((a) =>
    statusExcluidos.includes(a.status)
  ).length;

  const agendamentosFiltrados = agendamentosValidos.filter(
    (a) => !statusExcluidos.includes(a.status)
  );

  const totalFiltrado = agendamentosFiltrados.length;
  const totalResolvidosFiltrado = agendamentosFiltrados.filter((a) => a.status === "resolvido").length;
  const porcentagemResolvidosFiltrado = totalFiltrado
    ? ((totalResolvidosFiltrado / totalFiltrado) * 100).toFixed(2)
    : "0.00";
  const porcentagemResolvidos = totalAlunos
    ? ((agendamentosValidos.filter((a) => a.status === "resolvido").length / totalAlunos) * 100).toFixed(2)
    : "0.00";

  const todosStatus = [
    "resolvido",
    "agendado",
    "andamento",
    "sem retorno",
    "cancelado antes",
    "caso auditoria",
    "chargeback",
    "desconhece aluno",
    "inacessível",
    "inválido",
  ];

  const contagemPorStatus = {};
  todosStatus.forEach((status) => {
    contagemPorStatus[status] = agendamentosValidos.filter(
      (a) => a.status === status
    ).length;
  });

  const porcentagemPorStatus = {};
  todosStatus.forEach((status) => {
    const quantidade = contagemPorStatus[status] || 0;
    porcentagemPorStatus[status] = totalAlunos
      ? ((quantidade / totalAlunos) * 100).toFixed(1)
      : "0.0";
  });

  return (
    <div className={`container ${tema === "escuro" ? "escuro" : "claro"}`}>
      <div className="header-topo">
        <h1 className="titulo">Análise Geral</h1>
        <div className="linha-horizontal"></div>
      </div>

      <div className="dashboard-metricas">
        <div className="metric-box">
          <div className="metric-titulo">Resolvidos em Carteira Cheia</div>
          <div className="barra-resumo">
            <div className="barra-preenchida" style={{ width: `${porcentagemResolvidos}%` }}></div>
            <span className="valor">{porcentagemResolvidos}%</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-titulo">Resolvidos em Carteira Limpa</div>
          <div className="barra-resumo">
            <div className="barra-preenchida" style={{ width: `${porcentagemResolvidosFiltrado}%` }}></div>
            <span className="valor">{porcentagemResolvidosFiltrado}%</span>
          </div>
        </div>

        <div className="metric-box destaque-final">
          <div className="faltam-destaque">
            Faltam para Bater a Meta: <span className="faltam-valor">
              {(97 - parseFloat(porcentagemResolvidosFiltrado)).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      <div className="linha-horizontal"></div>

      <div className="gauge-bloco">
        <div className="painel-graficos">
          <div className="total-carteira destaque-label">TOTAL CARTEIRA: {totalAlunos}</div>
        </div>

        <div className="cards-graficos">
          {todosStatus.map((status, idx) => {
            const alunosDoStatus = agendamentosValidos.filter((a) => a.status === status);
            const quantidade = alunosDoStatus.length;
            const porcentagem = porcentagemPorStatus[status];

            return (
              <div
                key={idx}
                className={`grafico-card card-${status.replace(/\s/g, "-")}`}
                onClick={() => {
                  const statusSensivel = [
                    "cancelado antes",
                    "caso auditoria",
                    "chargeback",
                    "desconhece aluno",
                    "inacessível",
                    "inválido",
                  ];
                  if (statusSensivel.includes(status)) {
                    setAlunosSensiveis(alunosDoStatus);
                    setStatusSelecionado(status);
                    setMostrarDetalhesSensiveis(true);
                  }
                }}
              >
                <GaugeChart
                  status={status.charAt(0).toUpperCase() + status.slice(1)}
                  valor={porcentagem}
                  cor="#8f4de9"
                />
                <div className="grafico-dados">
                  <strong>{quantidade}</strong> alunos
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botão de Análise de Comerciais no final da página */}
      <button
        className="botao-analise"
        onClick={() => setMostrarAnalise(true)} // Exibe a análise de comerciais
      >
        Análise de Comerciais
      </button>

      {/* Exibindo a análise de comerciais */}
{mostrarAnalise && (
  <div className="analise-comerciais">
    <h3 className="titulo-analise">Top 5 Comerciais com Mais Assinaturas Desqualificadas</h3>

    {/* Container para a tabela de análise */}
    <div className="analise-container">
      {/* Tabela de ranking de comerciais */}
      <table className="ranking-tabela">
        <thead>
          <tr>
            <th>Posição</th>
            <th>Comercial</th>
            <th>Quantidade de Matrículas</th>
          </tr>
        </thead>
        <tbody>
          {comerciaisComProblemas.map((item, index) => (
            <tr
              key={index}
              className={`ranking-item ${index === 0 ? "top1" : index === 1 ? "top2" : index === 2 ? "top3" : ""}`}
            >
              <td className="ranking-posicao">#{index + 1}</td>
              <td className="ranking-comercial">{item[0]}</td>
              <td className="ranking-quantidade">{item[1]} matrículas</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Botão de fechar a análise */}
    <button
      className="botao-fechar-analise"
      onClick={() => setMostrarAnalise(false)} // Fecha a análise
    >
      Fechar
    </button>
  </div>
)}

      {mostrarDetalhesSensiveis && (
        <SidebarDetalhesSensiveis
          alunos={alunosSensiveis}
          status={statusSelecionado}
          onClose={() => setMostrarDetalhesSensiveis(false)}
        />
      )}
    </div>
  );
}