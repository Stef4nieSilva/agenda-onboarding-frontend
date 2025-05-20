import { useEffect, useState } from "react";
import { useTheme } from "./ThemeContext";
import ProgressBar from "./ProgressBar";
import "./App.css";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { tema } = useTheme();
  const [agendamentos, setAgendamentos] = useState([]);
  const [alertasMatricula, setAlertasMatricula] = useState([]);
  const [mostrarSidebar, setMostrarSidebar] = useState(false);

  if (localStorage.getItem("acessoLiberado") !== "true") {
    return (
      <div className="tela-senha">
        <h2>⛔ Acesso negado</h2>
        <p>Você precisa digitar a senha na tela inicial para visualizar esta página.</p>
        <a href="/" className="botao-link">Voltar</a>
      </div>
    );
  }

  useEffect(() => {
    fetch("https://api.sheetbest.com/sheets/f6d72757-6186-4c31-a811-3295c2e79eeb/tabs/Onboarding%20Maio")
      .then((res) => res.json())
      .then((data) => {
        const adaptado = data.map((item) => ({
          status: item["STATUS"]?.trim().toLowerCase(),
          email: item["EMAIL"]?.trim(),
          nome: item["ALUNO"]?.trim(),
          dataMatricula: item["DATA MAT"]?.trim(),
        }));

        setAgendamentos(adaptado);

        const hoje = new Date();
        const alerta = adaptado.filter((aluno) => {
          const [dia, mes, ano] = aluno.dataMatricula?.split("/") || [];
          if (!dia || !mes || !ano) return false;
          const dataMatricula = new Date(`${ano}-${mes}-${dia}`);
          const diffDias = Math.floor((hoje - dataMatricula) / (1000 * 60 * 60 * 24));
          return diffDias === 6 || diffDias === 7;
        });

        setAlertasMatricula(alerta);
      });
  }, []);

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

  const formatStatusClass = (status) => {
    return status
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  const contagemPorStatus = {};
  todosStatus.forEach((status) => {
    contagemPorStatus[status] = agendamentosValidos.filter(
      (a) => a.status === status
    ).length;
  });

  return (
    <div className={`container ${tema === "escuro" ? "escuro" : "claro"}`}>
      <div className="header-topo">
        <h1 className="titulo">Análise Geral</h1>
        <div className="linha-horizontal"></div>
        {alertasMatricula.length > 0 && (
          <div className="alerta-icon" onClick={() => setMostrarSidebar(!mostrarSidebar)}>
            ⚠️
          </div>
        )}
      </div>

      {mostrarSidebar && (
        <div className="alerta-sidebar">
          <h3>⚠️ Matrículas com 6 ou 7 dias</h3>
          <ul>
            {alertasMatricula.map((aluno, idx) => (
              <li key={idx}>
                <strong>{aluno.nome}</strong><br />
                📅 {aluno.dataMatricula}<br />
                📧 {aluno.email}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="lista-status">
        <div className="card-dashboard destaque">
          Total de Alunos
          <div style={{ fontSize: "24px" }}>{totalAlunos}</div>
        </div>
        <div className="card-dashboard destaque">
          Resolvidos: Zoom
          <div style={{ fontSize: "24px" }}>{totalResolvidosFiltrado}</div>
        </div>
        <div className="card-dashboard destaque">
          Total Não Resolvíveis
          <div style={{ fontSize: "24px" }}>{totalNaoResolvidos}</div>
        </div>
        <div className="card-dashboard destaque">
          Carteira Cheia
          <div style={{ fontSize: "24px" }}>{porcentagemResolvidos}%</div>
        </div>
        <div className="card-dashboard destaque">
          Carteira Ativa
          <div style={{ fontSize: "24px" }}>{porcentagemResolvidosFiltrado}%</div>
        </div>
      </div>

      <div style={{ margin: "30px auto", maxWidth: "600px" }}>
        <ProgressBar
          percentage={parseFloat(porcentagemResolvidosFiltrado)}
          meta={95}
        />
      </div>

      <div className="linha-separadora"></div>

      <div className="lista-status">
        {todosStatus.map((status, idx) => (
          <div
            key={idx}
            className={`card-dashboard card-${formatStatusClass(status)}`}
          >
            <span className="status-titulo">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            <div style={{ fontSize: "20px", marginTop: "8px", textAlign: "center" }}>
              {contagemPorStatus[status]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
