// src/Agenda.jsx
import "./App.css";
import { useState, useEffect } from "react";
import GradeHorariosDia from "./GradeHorariosDia";
import { useTheme } from "./ThemeContext";
import VisaoMensal from "./VisaoMensal";
import SidebarMensal from "./SidebarMensal";

export default function Agenda() {
  const { tema } = useTheme();

  const [agendamentos, setAgendamentos] = useState([]);
  const [agenteSelecionado, setAgenteSelecionado] = useState("Todos");
  const [filtroDia, setFiltroDia] = useState("Todos");
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [termoBusca, setTermoBusca] = useState("");
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [visao, setVisao] = useState("dia");
  const [erroFetch, setErroFetch] = useState(null);
  const [ausencias, setAusencias] = useState(() => {
    const salvo = localStorage.getItem("ausencias");
    return salvo ? JSON.parse(salvo) : {};
  });

  const [diaMensalSelecionado, setDiaMensalSelecionado] = useState(null);
  const [agenteMensalSelecionado, setAgenteMensalSelecionado] = useState(null);

  // ─── Helpers para manipular datas ────────────────────────────────────

  // Converte "dd/mm/aaaa" num objeto Date
  const parseDataBR = (dataBR) => {
    const partes = dataBR.split("/");
    if (partes.length < 3) return null;
    const [dia, mes, ano] = partes.map((p) => p.trim());
    return new Date(`${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`);
  };

  // Retorna true se "dd/mm/aaaa" estiver dentro da semana atual (segunda a domingo)
const estaNaSemana = (dataTexto) => {
  const data = parseDataBR(dataTexto);
  if (!data || isNaN(data)) return false;

  const hoje = new Date();
  const diaSemana = hoje.getDay(); // 0 (domingo) a 6 (sábado)
  const diferencaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;

  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() + diferencaSegunda);

  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6);

  // normaliza horários
  data.setHours(0, 0, 0, 0);
  inicioSemana.setHours(0, 0, 0, 0);
  fimSemana.setHours(0, 0, 0, 0);

  return data >= inicioSemana && data <= fimSemana;
};

  const aoClicarNoDia = (dataStr, agente) => {
    setDiaMensalSelecionado(dataStr);
    setAgenteMensalSelecionado(agente);
  };

  useEffect(() => {
    localStorage.setItem("ausencias", JSON.stringify(ausencias));
  }, [ausencias]);

const hoje = new Date();
const hojeBR = `${String(hoje.getDate()).padStart(2, "0")}/${String(
  hoje.getMonth() + 1
).padStart(2, "0")}/${hoje.getFullYear()}`;

  // ─── Fetch + normalização do status em minúsculas ───────────────────
  useEffect(() => {
    fetch(
      "https://api.sheetbest.com/sheets/f6d72757-6186-4c31-a811-3295c2e79eeb/tabs/Onboarding%20Junho"
    )
      .then((res) => res.json())
      .then((data) => {
        // Função que normaliza chaves (remove espaços e deixa tudo em lowercase)
        const normalizarChaves = (obj) =>
          Object.fromEntries(
            Object.entries(obj).map(([chave, valor]) => [
              chave.trim().toLowerCase(),
              typeof valor === "string" ? valor.trim() : valor,
            ])
          );

        const adaptado = data.map((itemOriginal) => {
          const item = normalizarChaves(itemOriginal);

          // Monta “dia” como dd/mm/aaaa
          const raw = item["dia da aula zero"]?.toString() || "";
          const partes = raw.split("/").map((p) => p.trim());
          let dia = partes[0]?.padStart(2, "0") || "";
          let mes = partes[1]?.padStart(2, "0") || "";
          let ano =
            partes[2]?.length === 4
              ? partes[2]
              : String(new Date().getFullYear());
          const dataFormatada = `${dia}/${mes}/${ano}`;

          // Formata horário (“9” → “09:00”, “9h” → “09:00”, “9:30” → “09:30”)
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
            nome: item["aluno"],
            telefone: item["telefone"],
            dia: dataFormatada,
            horario: horarioRaw,
            // **Forçamos status em letras minúsculas**
            status: item["status"] ? item["status"].toLowerCase() : "",
            agente: item["agente"],
            comercial: item["comercial"],
            dataMatricula: item["data mat"],
            email: item["email"],
            inicioAulas: item["inicio aulas"],
          };
        });

        setAgendamentos(adaptado);
        setErroFetch(null);
        console.log("TOTAL DE AGENDAMENTOS:", adaptado.length);
console.log("TODOS OS DIAS:", adaptado.map(a => a.dia));
      })
      .catch((err) => {
        console.error("Erro ao buscar dados:", err);
        setErroFetch(
          "Não foi possível carregar os dados da agenda. Tente atualizar a página."
        );
      });
  }, []);

  // ─── Geração de todos horários possíveis (9:00 até 21:30) ─────────────────
// ─── Geração de todos horários possíveis (9:00 até 21:30) ─────────────────
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

// ─── Filtro principal para a visão diária (GradeHorariosDia) ─────────────────
const agendamentosFiltradosDia = agendamentos.filter((item) => {
  const statusNormalizado = item.status?.toString().trim().toLowerCase() || "";
  const diaItem = item.dia?.toString().trim();
  const matchAgente = agenteSelecionado === "Todos" || item.agente === agenteSelecionado;
  const matchBusca = item.nome?.toLowerCase().includes(termoBusca) || false;

  const statusAceitosHoje = ["agendado", "resolvido", "andamento"];
  const statusAceitosData = ["agendado", "resolvido", "andamento"];

  let matchStatus = false;
  let matchDia = false;

  if (filtroDia === "Hoje") {
    matchDia = diaItem === hojeBR;
    matchStatus = statusAceitosHoje.includes(statusNormalizado);
  } else if (filtroDia === "Todos") {
    matchDia = true;
    matchStatus = statusNormalizado === "agendado";
  } else if (filtroDia === "Data") {
    matchDia = diaItem === dataSelecionada;
    matchStatus = statusAceitosData.includes(statusNormalizado);
  }

  console.log("Comparando datas:", diaItem, "===", hojeBR);

  return (
    matchAgente &&
    matchDia &&
    matchStatus &&
    (termoBusca ? matchBusca : true)
  );
});


// ─── Filtro para a visão semanal (GradeAgentes) ───────────────────────────────
const agendamentosPorAgente = {};
todosAgentesOrdenados.forEach((agente) => {
  agendamentosPorAgente[agente] = agendamentos
    .filter((item) => {
      const pertenceAoAgente = item.agente === agente;
      const statusNormalizado = item.status?.toString().trim().toLowerCase() || "";
      const diaItem = item.dia?.toString().trim();

      // Regras por filtro de dia + status
      const mostrar =
        filtroDia === "Hoje"
          ? diaItem === hojeBR && ["agendado", "resolvido"].includes(statusNormalizado)
          : filtroDia === "Todos"
          ? statusNormalizado === "agendado"
          : filtroDia === "Data"
          ? diaItem === dataSelecionada && ["agendado", "resolvido"].includes(statusNormalizado)
          : false;

      const matchBusca = item.nome?.toLowerCase().includes(termoBusca) || false;

      return (
        pertenceAoAgente &&
        mostrar &&
        (termoBusca ? matchBusca : true)
      );
    })
    .sort((a, b) => (a.horario || "").localeCompare(b.horario || ""));
});


  const horariosDoDia = gerarHorarios();

  return (
    <div className={`container ${tema === "escuro" ? "escuro" : "claro"}`}>
      <div className="header-topo">
        <h1 className="titulo">AGENDA ONBOARDING</h1>
        <div className="linha-horizontal"></div>
      </div>

      {erroFetch && (
        <div
          className="mensagem-erro"
          role="alert"
          style={{ color: "red", marginBottom: "1rem" }}
        >
          {erroFetch}
        </div>
      )}

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
            {todosAgentesOrdenados.map((ag) => (
              <option key={ag} value={ag}>
                {ag}
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

      {visao === "dia" && filtroDia === "Todos" ? (
        <VisaoMensal agendamentos={agendamentos} aoClicarNoDia={aoClicarNoDia} />
      ) : visao === "dia" ? (
        <GradeHorariosDia
          agendamentos={agendamentosFiltradosDia}
          agentes={agentesFiltrados}
          setAlunoSelecionado={setAlunoSelecionado}
          horarios={horariosDoDia}
          ausencias={ausencias}
        />
      ) : null}

      {visao === "semana" && (
        <div className={`grade-agentes ${agenteSelecionado !== "Todos" ? "unico" : ""}`}>
          {agenteSelecionado === "Todos"
            ? todosAgentesOrdenados.map((ag) => {
                const lista = agendamentosPorAgente[ag] || [];
                return (
                  <div key={ag} className="coluna-agente">
                    <img src={`/fotos/${ag}.jpg`} alt={ag} className="foto-agente" />
                    <h2 className="nome-agente">{ag}</h2>
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
                              aluno.status === "agendado" ? "aguardando" : "resolvido"
                            }`}
                          >
                            {aluno.status === "agendado" ? "Aguardando" : "Resolvido"}
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
                    <span className={`status ${aluno.status}`}>{aluno.status}</span>
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
            <p><strong>Nome:</strong> {alunoSelecionado.nome}</p>
            <p><strong>Telefone:</strong> {alunoSelecionado.telefone}</p>
            <p><strong>Email:</strong> {alunoSelecionado.email}</p>
            <p><strong>Comercial:</strong> {alunoSelecionado.comercial}</p>
            <p><strong>Data da Matrícula:</strong> {alunoSelecionado.dataMatricula}</p>
            <p><strong>Início das Aulas:</strong> {alunoSelecionado.inicioAulas}</p>
            <p><strong>Data da Aula Zero:</strong> {alunoSelecionado.dia}</p>
            <p><strong>Horário:</strong> {alunoSelecionado.horario}</p>
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
