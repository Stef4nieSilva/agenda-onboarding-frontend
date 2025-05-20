import "./App.css";
import { useState, useEffect } from "react";
import GradeHorariosDia from "./GradeHorariosDia";

export default function Agenda() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [agenteSelecionado, setAgenteSelecionado] = useState("Todos");
  const [filtroDia, setFiltroDia] = useState("Todos");
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [termoBusca, setTermoBusca] = useState("");
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [senhaDigitada, setSenhaDigitada] = useState("");
  const [acessoLiberado, setAcessoLiberado] = useState(false);
  const [visao, setVisao] = useState("dia");
  const [erroFetch, setErroFetch] = useState(null);

  useEffect(() => {
    const acessoSalvo = localStorage.getItem("acessoLiberado");
    if (acessoSalvo === "true") {
      setAcessoLiberado(true);
    }
  }, []);

  const hoje = new Date();
  // Formatar com dia, mês e ano completo para evitar conflitos de datas
  const hojeBR = `${String(hoje.getDate()).padStart(2, "0")}/${String(
    hoje.getMonth() + 1
  ).padStart(2, "0")}/${hoje.getFullYear()}`;

  useEffect(() => {
    fetch(
      "https://api.sheetbest.com/sheets/f6d72757-6186-4c31-a811-3295c2e79eeb/tabs/Onboarding%20Maio"
    )
      .then((res) => res.json())
      .then((data) => {
        const adaptado = data.map((item) => {
          let dataRaw =
            typeof item["DIA DA AULA ZERO"] === "string"
              ? item["DIA DA AULA ZERO"].trim()
              : "";

          // Aqui tentar pegar dia, mês e ano (assumir ano atual se não tiver)
          let dia = "",
            mes = "",
            ano = String(new Date().getFullYear());
          if (dataRaw.includes("/")) {
            const partes = dataRaw.split("/").map((p) => p.trim());
            dia = partes[0]?.padStart(2, "0") || "";
            mes = partes[1]?.padStart(2, "0") || "";
            ano = partes[2]?.length === 4 ? partes[2] : ano; // se ano existir e for 4 dígitos
          }
          const dataFormatada = `${dia}/${mes}/${ano}`;

          let horarioRaw = item["HORÁRIO DA AULA ZERO"]?.toString().trim() || "";

          if (/^\d{1,2}$/.test(horarioRaw)) {
            horarioRaw = horarioRaw.padStart(2, "0") + ":00";
          } else if (/^\d{1,2}h$/.test(horarioRaw)) {
            horarioRaw = horarioRaw.replace("h", ":00").padStart(5, "0");
          } else if (/^\d{1,2}:\d{2}$/.test(horarioRaw)) {
            const [h, m] = horarioRaw.split(":");
            horarioRaw = `${h.padStart(2, "0")}:${m}`;
          }

          return {
            nome: item["ALUNO"]?.trim(),
            telefone: item["TELEFONE"]?.trim(),
            dia: dataFormatada,
            horario: horarioRaw,
            status: item["STATUS"]?.trim().toLowerCase(),
            agente: item["AGENTE"]?.trim(),
            comercial: item["COMERCIAL"]?.trim(),
            dataMatricula: item["DATA MAT"]?.trim(),
            email: item["EMAIL"]?.trim(),
            inicioAulas: item["INICIO AULAS"]?.trim(),
          };
        });
        setAgendamentos(adaptado);
        setErroFetch(null);
      })
      .catch((err) => {
        console.error("Erro ao buscar dados:", err);
        setErroFetch(
          "Não foi possível carregar os dados da agenda. Tente atualizar a página."
        );
      });
  }, []);

  // Função para gerar horários padrões + horários extras normalizados
  const gerarHorarios = () => {
    const base = new Set();

    for (let hora = 9; hora <= 21; hora++) {
      for (let minuto of [0, 15, 30, 45]) {
        if (hora === 21 && minuto > 30) break;
        const h = String(hora).padStart(2, "0");
        const m = String(minuto).padStart(2, "0");
        base.add(`${h}:${m}`);
      }
    }

    agendamentos.forEach((a) => {
      if (a.horario) {
        const [h, m] = a.horario.split(":");
        const horarioNormalizado = `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
        base.add(horarioNormalizado);
      }
    });

    return Array.from(base).sort((a, b) => a.localeCompare(b));
  };

 const todosAgentesOrdenados = ["Anny", "Diego", "Stefanie", "Vanessa"];

const agentesFiltrados =
  agenteSelecionado === "Todos" ? todosAgentesOrdenados : [agenteSelecionado];

const diaParaFiltrar =
  filtroDia === "Hoje"
    ? hojeBR
    : filtroDia === "Data"
    ? dataSelecionada
    : null; // se filtro é Todos, não filtrar por data

// Filtra agendamentos para visão por dia, considerando filtro de agente e termoBusca
const agendamentosFiltradosDia = agendamentos.filter((item) => {
  const matchStatus = ["agendado", "resolvido"].includes(item.status);
  const matchDia = diaParaFiltrar ? item.dia === diaParaFiltrar : true;
  const matchAgente =
    agenteSelecionado === "Todos" || item.agente === agenteSelecionado;
  const matchBusca = item.nome
    ? item.nome.toLowerCase().includes(termoBusca)
    : false;

  return matchStatus && matchDia && matchAgente && (termoBusca ? matchBusca : true);
});

  // Monta agendamentos por agente já considerando filtros globais
  const agendamentosPorAgente = {};
  todosAgentesOrdenados.forEach((agente) => {
    agendamentosPorAgente[agente] = agendamentos
      .filter((item) => {
        const pertenceAoAgente = item.agente === agente;

        const matchDia =
          filtroDia === "Todos" ||
          (filtroDia === "Hoje" && item.dia === hojeBR) ||
          (filtroDia === "Data" && item.dia === dataSelecionada);

        const matchStatus =
          filtroDia === "Todos"
            ? item.status === "agendado"
            : ["agendado", "resolvido"].includes(item.status);

        const matchBusca = item.nome
          ? item.nome.toLowerCase().includes(termoBusca)
          : false;

        return (
          pertenceAoAgente &&
          matchDia &&
          matchStatus &&
          (termoBusca ? matchBusca : true)
        );
      })
      .sort((a, b) => (a.horario || "").localeCompare(b.horario || ""));
  });

  const horariosDoDia = gerarHorarios();

  // Função para validar senha externa (pode ser ajustada para backend)
  const SENHA_CORRETA = "wiser2025";

return (
  <>
    {!acessoLiberado ? (
 <div className="tela-senha">
  <div className="card-login">
    <img
      src="/img/onboarding-logo.png"
      alt="Equipe Onboarding"
      className="imagem-login"
    />
    <h1 className="titulo-onboarding">Onboarding Live</h1>
    <p className="subtitulo-onboarding">Acesso restrito aos agentes</p>
    <input
      type="password"
      className="input-senha"
      placeholder="Digite a senha"
      value={senhaDigitada}
      onChange={(e) => setSenhaDigitada(e.target.value)}
      aria-label="Senha de acesso"
    />
    <button
      onClick={() => {
        if (senhaDigitada === "wiser2025") {
          setAcessoLiberado(true);
          localStorage.setItem("acessoLiberado", "true");
        } else {
          alert("Senha incorreta. Tente novamente.");
        }
      }}
      aria-label="Entrar"
    >
      Entrar
    </button>
  </div>
</div>
      ) : (
        <div className="container">
          <div className="header-topo">
            <h1 className="titulo">AGENDA ONBOARDING</h1>
            <div className="linha-horizontal"></div>
          </div>

          {erroFetch && (
            <div className="mensagem-erro" role="alert" style={{ color: "red", marginBottom: "1rem" }}>
              {erroFetch}
            </div>
          )}

          <div className="filtros-container">
            <div className="filtros-esquerda">
              <button
                className={filtroDia === "Hoje" ? "ativo" : ""}
                onClick={() => setFiltroDia("Hoje")}
                aria-pressed={filtroDia === "Hoje"}
              >
                Hoje
              </button>
              <button
                className={filtroDia === "Todos" ? "ativo" : ""}
                onClick={() => setFiltroDia("Todos")}
                aria-pressed={filtroDia === "Todos"}
              >
                Todos
              </button>
              <input
                type="date"
                className="input-data"
                onChange={(e) => {
                  const [ano, mes, dia] = e.target.value.split("-");
                  setDataSelecionada(`${dia}/${mes}/${ano}`);
                  setFiltroDia("Data");
                }}
                aria-label="Selecionar data"
              />
            </div>

            <div className="filtros-direita">
              <select
                value={agenteSelecionado}
                onChange={(e) => setAgenteSelecionado(e.target.value)}
                aria-label="Selecionar agente"
              >
                <option value="Todos">Agente</option>
                {todosAgentesOrdenados.map((agente) => (
                  <option key={agente} value={agente}>
                    {agente}
                  </option>
                ))}
              </select>
              <input
                type="text"
                className="input-busca"
                placeholder="Buscar aluno..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value.toLowerCase())}
                aria-label="Buscar aluno"
              />
            </div>
          </div>

          <div className="toggle-visao">
            <button
              className={visao === "dia" ? "ativo" : ""}
              onClick={() => setVisao("dia")}
              aria-pressed={visao === "dia"}
            >
              Visualizar por Dia
            </button>
            <button
              className={visao === "semana" ? "ativo" : ""}
              onClick={() => setVisao("semana")}
              aria-pressed={visao === "semana"}
            >
              Visualizar por Semana
            </button>
          </div>

          {visao === "dia" && (
            <GradeHorariosDia
              agendamentos={agendamentosFiltradosDia}
              agentes={
                agenteSelecionado === "Todos"
                  ? todosAgentesOrdenados
                  : [agenteSelecionado]
              }
              setAlunoSelecionado={setAlunoSelecionado}
              horarios={horariosDoDia}
            />
          )}

          {visao === "semana" && (
            <div
              className={`grade-agentes ${
                agenteSelecionado !== "Todos" ? "unico" : ""
              }`}
            >
              {agenteSelecionado === "Todos"
                ? todosAgentesOrdenados.map((agente) => {
                    const lista = agendamentosPorAgente[agente] || [];
                    return (
                      <div key={agente} className="coluna-agente">
                        <img
                          src={`/fotos/${agente}.jpg`}
                          alt={agente}
                          className="foto-agente"
                        />
                        <h2 className="nome-agente">{agente}</h2>
                        {lista.length === 0 ? (
                          <p className="sem-agendamentos">Sem agendamentos</p>
                        ) : (
                          lista.map((aluno) => (
                            <div
                              className="card"
                              key={`${aluno.nome}-${aluno.dia}-${aluno.horario}`}
                              onClick={() => setAlunoSelecionado(aluno)}
                              style={{ cursor: "pointer" }}
                              tabIndex={0}
                              role="button"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  setAlunoSelecionado(aluno);
                                }
                              }}
                              aria-label={`Ver detalhes do aluno ${aluno.nome}`}
                            >
                              <h3>{aluno.nome}</h3>
                              <p>📞 {aluno.telefone}</p>
                              <p>📅 {aluno.dia}</p>
                              <p>⏰ {aluno.horario}</p>
                              <span
                                className={`status ${
                                  aluno.status === "agendado"
                                    ? "aguardando"
                                    : "resolvido"
                                }`}
                              >
                                {aluno.status === "agendado"
                                  ? "Aguardando"
                                  : "Resolvido"}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    );
                  })
                : (
                  <>
                    <div className="agente-topo-unico">
                      <img
                        src={`/fotos/${agenteSelecionado}.jpg`}
                        alt={agenteSelecionado}
                        className="foto-agente"
                      />
                      <h2 className="nome-agente">{agenteSelecionado}</h2>
                    </div>
                    {agendamentosPorAgente[agenteSelecionado]?.map((aluno) => (
                      <div
                        className="card"
                        key={`${aluno.nome}-${aluno.dia}-${aluno.horario}`}
                        onClick={() => setAlunoSelecionado(aluno)}
                        style={{ cursor: "pointer" }}
                        tabIndex={0}
                        role="button"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setAlunoSelecionado(aluno);
                          }
                        }}
                        aria-label={`Ver detalhes do aluno ${aluno.nome}`}
                      >
                        <h3>{aluno.nome}</h3>
                        <p>📞 {aluno.telefone}</p>
                        <p>📅 {aluno.dia}</p>
                        <p>⏰ {aluno.horario}</p>
                        <span className={`status ${aluno.status}`}>
                          {aluno.status}
                        </span>
                      </div>
                    ))}
                  </>
                )}
            </div>
          )}

          {alunoSelecionado && (
            <div
              className="drawer-overlay"
              onClick={() => setAlunoSelecionado(null)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="detalhes-aluno-titulo"
            >
              <div
                className="drawer-conteudo"
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1}
              >
                <h2 id="detalhes-aluno-titulo">Detalhes do Aluno</h2>
                <p>
                  <strong>Nome:</strong> {alunoSelecionado.nome}
                </p>
                <p>
                  <strong>Telefone:</strong> {alunoSelecionado.telefone}
                </p>
                <p>
                  <strong>Email:</strong> {alunoSelecionado.email}
                </p>
                <p>
                  <strong>Comercial:</strong> {alunoSelecionado.comercial}
                </p>
                <p>
                  <strong>Data da Matrícula:</strong> {alunoSelecionado.dataMatricula}
                </p>
                <p>
                  <strong>Início das Aulas:</strong> {alunoSelecionado.inicioAulas}
                </p>
                <p>
                  <strong>Data da Aula Zero:</strong> {alunoSelecionado.dia}
                </p>
                <p>
                  <strong>Horário:</strong> {alunoSelecionado.horario}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      alunoSelecionado.status?.trim().toLowerCase() === "resolvido"
                        ? "status-resolvido"
                        : ""
                    }
                  >
                    {alunoSelecionado.status}
                  </span>
                </p>
                <button
                  onClick={() => setAlunoSelecionado(null)}
                  aria-label="Fechar detalhes do aluno"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
