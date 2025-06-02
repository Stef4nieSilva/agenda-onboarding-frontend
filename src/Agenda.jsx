// Agenda.jsx
import "./App.css";
import { useState, useEffect } from "react";
import GradeHorariosDia from "./GradeHorariosDia";
import { useTheme } from "./ThemeContext";
import VisaoMensal from "./VisaoMensal";
import SidebarMensal from "./SidebarMensal";

export default function Agenda() {
  const { tema } = useTheme();

  // ─── Estados ────────────────────────────────────────────────────────────────
  const [agendamentos, setAgendamentos] = useState([]); // todos os registros de Junho
  const [agenteSelecionado, setAgenteSelecionado] = useState("Todos");
  const [filtroDia, setFiltroDia] = useState("Todos"); // "Todos", "Hoje" ou "Data"
  const [dataSelecionada, setDataSelecionada] = useState(""); // dd/mm/yyyy
  const [termoBusca, setTermoBusca] = useState("");
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [visao, setVisao] = useState("dia"); // "dia" ou "semana"
  const [erroFetch, setErroFetch] = useState(null);

  const [ausencias, setAusencias] = useState(() => {
    const salvo = localStorage.getItem("ausencias");
    return salvo ? JSON.parse(salvo) : {};
  });

  const [diaMensalSelecionado, setDiaMensalSelecionado] = useState(null);
  const [agenteMensalSelecionado, setAgenteMensalSelecionado] = useState(null);

  // Quando clica em dia do modo mensal, abre SidebarMensal
  const aoClicarNoDia = (dataStr, agente) => {
    setDiaMensalSelecionado(dataStr);
    setAgenteMensalSelecionado(agente);
  };

  // Salva ausências no localStorage sempre que mudam
  useEffect(() => {
    localStorage.setItem("ausencias", JSON.stringify(ausencias));
  }, [ausencias]);

  // Data de hoje em dd/mm/yyyy
  const hoje = new Date();
  const hojeBR = `${String(hoje.getDate()).padStart(2, "0")}/${String(
    hoje.getMonth() + 1
  ).padStart(2, "0")}/${hoje.getFullYear()}`;

  // ─── Fetch da aba “Onboarding Junho” ─────────────────────────────────────────
  useEffect(() => {
    fetch(
      "https://api.sheetbest.com/sheets/f6d72757-6186-4c31-a811-3295c2e79eeb/tabs/Onboarding%20Junho"
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("DADOS DA PLANILHA", data);

        // 1) Normaliza chaves e valores: transforma " STATUS " → "status", remove espaços extras
        const normalizarChaves = (obj) =>
          Object.fromEntries(
            Object.entries(obj).map(([chave, valor]) => [
              chave.trim().toLowerCase(),
              typeof valor === "string" ? valor.trim() : valor,
            ])
          );

        // 2) Converte "dd/mm" para objeto Date vigente em 2025 (ano atual)
        const parseDataBR = (dataBR) => {
          const [dia, mes] = dataBR.split("/");
          const hoje = new Date();
          const ano = hoje.getFullYear();
          return new Date(`${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`);
        };

        // 3) Verifica se está na semana atual (segunda → domingo)
        const estaNaSemana = (dataTexto) => {
          if (!dataTexto) return false;
          const data = parseDataBR(dataTexto);
          const hoje = new Date();
          const diaSemana = hoje.getDay(); // 0=domingo, 1=segunda, ...
          const inicio = new Date(hoje);
          // se hoje é domingo (0), inicio volta para segunda anterior; se hoje é segunda (1), volta 0 → 1ª
          inicio.setDate(hoje.getDate() - diaSemana + 1);
          const fim = new Date(inicio);
          fim.setDate(inicio.getDate() + 6); // domingo

          data.setHours(0, 0, 0, 0);
          inicio.setHours(0, 0, 0, 0);
          fim.setHours(0, 0, 0, 0);

          return data >= inicio && data <= fim;
        };

        // 4) Mapeia cada objeto bruto para o formato que seu app usa
        const adaptado = data.map((itemOriginal) => {
          const item = normalizarChaves(itemOriginal);

          // – Data formatada (= dd/mm/yyyy), respeitando se já vier com ou sem ano
          const raw = typeof item["dia da aula zero"] === "string" ? item["dia da aula zero"] : "";
          const partes = raw.split("/").map((v) => v.trim());
          const dia = partes[0]?.padStart(2, "0") || "";
          const mes = partes[1]?.padStart(2, "0") || "";
          // se vier com ano (“dd/mm/2025”), usa-o; senão, coloca o ano atual
          const ano =
            partes[2]?.length === 4 ? partes[2] : String(new Date().getFullYear());
          const dataFormatada = `${dia}/${mes}/${ano}`;

          // – Horário formatado (“9” → “09:00”, “9h” → “09:00”, “9:30” → “09:30”)
          let horarioRaw = item["horário da aula zero"]?.toString() || "";
          if (/^\d{1,2}$/.test(horarioRaw)) {
            horarioRaw = horarioRaw.padStart(2, "0") + ":00";
          } else if (/^\d{1,2}h$/.test(horarioRaw)) {
            horarioRaw = horarioRaw.replace("h", ":00").padStart(5, "0");
          } else if (/^\d{1,2}:\d{2}$/.test(horarioRaw)) {
            const [h, m] = horarioRaw.split(":");
            horarioRaw = `${h.padStart(2, "0")}:${m}`;
          }

          return {
            // AQUI VOCÊ PUXA TODAS AS COLUNAS NECESSÁRIAS (em minúsculo, sem espaços)
            nome: item["aluno"], // coluna “Aluno”
            telefone: item["telefone"],
            dia: dataFormatada, // dd/mm/yyyy
            horario: horarioRaw,
            status: item["status"], // “agendado” ou “resolvido”
            agente: item["agente"],
            comercial: item["comercial"],
            dataMatricula: item["data mat"], // “data mat” no cabeçalho
            email: item["email"],
            inicioAulas: item["inicio aulas"], // “inicio aulas”
          };
        });

        // 5) Carrega todos os registros em state — sem filtrar aqui
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

  // ─── Gera todos os horários possíveis (09:00-21:30 em 15min) ─────────────────
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

  // ─── Filtra agendamentos para “Visualizar por Dia” ────────────────────────────
  const diaParaFiltrar =
    filtroDia === "Hoje" ? hojeBR : filtroDia === "Data" ? dataSelecionada : null;

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

  // ─── Organiza “Visualizar por Semana” ─────────────────────────────────────────
  // – Preencha a lista de agentes em ordem alfabética
  const todosAgentesOrdenados = ["Anny", "Diego", "Stefanie", "Vanessa"];

  // A função estaNaSemana deve estar acessível aqui para o filtro por semana
  const estaNaSemana = (dataTexto) => {
    if (!dataTexto) return false;
    const [dia, mes] = dataTexto.split("/");
    const ano = new Date().getFullYear();
    const data = new Date(`${ano}-${mes}-${dia}`);

    const hoje = new Date();
    const diaSemana = hoje.getDay();
    const inicio = new Date(hoje);
    inicio.setDate(hoje.getDate() - diaSemana + 1);
    const fim = new Date(inicio);
    fim.setDate(inicio.getDate() + 6);

    data.setHours(0, 0, 0, 0);
    inicio.setHours(0, 0, 0, 0);
    fim.setHours(0, 0, 0, 0);

    return data >= inicio && data <= fim;
  };

  const agendamentosPorAgente = {};
  todosAgentesOrdenados.forEach((agente) => {
    agendamentosPorAgente[agente] = agendamentos
      .filter((item) => {
        const pertenceAoAgente = item.agente === agente;

        // Quando visao="semana", só deixa os que caem na semana atual
        const matchSemana =
          visao === "semana" ? estaNaSemana(item.dia) : true;

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
          matchSemana &&
          matchDia &&
          matchStatus &&
          (termoBusca ? matchBusca : true)
        );
      })
      .sort((a, b) => (a.horario || "").localeCompare(b.horario || ""));
  });

  // ─── Calcula horários do dia (para GradeHorariosDia) ──────────────────────────
  const horariosDoDia = gerarHorarios();

  // ─── Renderização ─────────────────────────────────────────────────────────────
  return (
    <div className={`container ${tema === "escuro" ? "escuro" : "claro"}`}>
      <div className="header-topo">
        <h1 className="titulo">AGENDA ONBOARDING</h1>
        <div className="linha-horizontal"></div>
      </div>

      {/* Mensagem de erro se falhar o fetch */}
      {erroFetch && (
        <div
          className="mensagem-erro"
          role="alert"
          style={{ color: "red", marginBottom: "1rem" }}
        >
          {erroFetch}
        </div>
      )}

      {/* ── Controles de filtros (Dia, Todos, Data, Agente, Busca) ──────────────── */}
      <div className="filtros-container">
        <div className="filtros-esquerda">
          <button
            className={filtroDia === "Hoje" ? "ativo" : ""}
            onClick={() => {
              setFiltroDia("Hoje");
              setVisao("dia");
            }}
            aria-pressed={filtroDia === "Hoje"}
          >
            Hoje
          </button>

          <button
            className={filtroDia === "Todos" ? "ativo" : ""}
            onClick={() => {
              setFiltroDia("Todos");
              setAgenteSelecionado("Todos");
              setVisao("dia");
            }}
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
              setVisao("dia");
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

      {/* ── Botões de visões (Dia / Semana) ──────────────────────────────────────── */}
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

        {/* No modo “dia”, mostra controles de ausência */}
        {visao === "dia" && agenteSelecionado !== "Todos" && (
          <div className="controle-ausencia">
            <label>
              Entrada:
              <input
                type="time"
                onChange={(e) => {
                  const entrada = e.target.value;
                  setAusencias((prev) => ({
                    ...prev,
                    [agenteSelecionado]: {
                      ...prev[agenteSelecionado],
                      entrada,
                    },
                  }));
                }}
                value={ausencias[agenteSelecionado]?.entrada || ""}
              />
            </label>

            <label>
              Início do Intervalo:
              <input
                type="time"
                onChange={(e) => {
                  const inicioIntervalo = e.target.value;
                  const [h, m] = inicioIntervalo.split(":").map(Number);
                  const fimDate = new Date();
                  fimDate.setHours(h);
                  fimDate.setMinutes(m + 60);
                  const fimIntervalo = fimDate.toTimeString().slice(0, 5);

                  setAusencias((prev) => ({
                    ...prev,
                    [agenteSelecionado]: {
                      ...prev[agenteSelecionado],
                      inicioIntervalo,
                      fimIntervalo,
                    },
                  }));
                }}
                value={ausencias[agenteSelecionado]?.inicioIntervalo || ""}
              />
            </label>

            <label>
              Fim do Atendimento:
              <input
                type="time"
                onChange={(e) => {
                  const fimExpediente = e.target.value;
                  setAusencias((prev) => ({
                    ...prev,
                    [agenteSelecionado]: {
                      ...prev[agenteSelecionado],
                      fimExpediente,
                    },
                  }));
                }}
                value={ausencias[agenteSelecionado]?.fimExpediente || ""}
              />
            </label>
          </div>
        )}
      </div>

      {/* ── Renderiza a grade do dia ou a visão mensal ───────────────────────────── */}
      {visao === "dia" && filtroDia === "Todos" ? (
        <VisaoMensal agendamentos={agendamentos} aoClicarNoDia={aoClicarNoDia} />
      ) : visao === "dia" ? (
        <GradeHorariosDia
          agendamentos={agendamentosFiltradosDia}
          agentes={todosAgentesOrdenados}
          setAlunoSelecionado={setAlunoSelecionado}
          horarios={horariosDoDia}
          ausencias={ausencias}
        />
      ) : null}

      {/* ── Renderiza grade de agentes na visão por Semana ───────────────────────── */}
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

      {/* ── Drawer de detalhes do aluno ─────────────────────────────────────────── */}
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
                    : "status-agendado"
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

      {/* ── Sidebar mensal (quando clica em dia no modo mensal) ─────────────────── */}
      {diaMensalSelecionado && agenteMensalSelecionado && (
        <SidebarMensal
          dia={diaMensalSelecionado}
          agente={agenteMensalSelecionado}
          agendamentos={agendamentos.filter(
            (a) => a.dia === diaMensalSelecionado && a.agente === agenteMensalSelecionado
          )}
          onClose={() => {
            setDiaMensalSelecionado(null);
            setAgenteMensalSelecionado(null);
          }}
        />
      )}
    </div>
  );
}
