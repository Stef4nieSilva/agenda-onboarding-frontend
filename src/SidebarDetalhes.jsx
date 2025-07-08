// SidebarDetalhes.jsx
import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import html2pdf from "html2pdf.js";
import "./App.css";

const statusCriticos = [
  "inacessível",
  "inválido",
  "desconhece aluno",
  "chargeback",
  "cancelado antes",
  "caso auditoria",
];

const cores = ["#a259ff", "#b88af9", "#c6b4f2", "#81c784", "#ffc107", "#ff5252"];

export default function SidebarDetalhes({ agente, onClose, rankingGeral }) {
  const [statusSensiveis, setStatusSensiveis] = useState([]);
  const [pendentesAntigos, setPendentesAntigos] = useState([]);
  const [possiveisInacessiveis, setPossiveisInacessiveis] = useState([]);
  const [ranking, setRanking] = useState({});

  useEffect(() => {
    const encontrados = Object.entries(agente.statusDetalhado).filter(([status]) =>
      statusCriticos.includes(status)
    );
    setStatusSensiveis(encontrados);

    const hoje = new Date();
    const pendentes = agente.alunos?.filter((aluno) => {
      const status = aluno.status?.toLowerCase();
      if (status !== "agendado" && status !== "sem retorno") return false;
      const [dia, mes, ano] = aluno.dia?.split("/") || [];
      const data = new Date(`${ano}-${mes}-${dia}`);
      const diffDias = (hoje - data) / (1000 * 60 * 60 * 24);
      return diffDias >= 3;
    }) || [];
    setPendentesAntigos(pendentes);

    const suspeitos = agente.alunos?.filter((aluno) => {
      const status = aluno.status?.toLowerCase();
      if (status === "resolvido") return false;
      const [dia, mes, ano] = aluno.dataMatricula?.split("/") || [];
      if (!dia || !mes || !ano) return false;
      const dataMat = new Date(`${ano}-${mes}-${dia}`);
      const dias = Math.floor((hoje - dataMat) / (1000 * 60 * 60 * 24));
      return dias > 10;
    }) || [];
    setPossiveisInacessiveis(suspeitos);

    if (rankingGeral && rankingGeral.length) {
      const ordenadoPorCheia = [...rankingGeral].sort((a, b) => parseFloat(b.pctCheia) - parseFloat(a.pctCheia));
      const ordenadoPorAtiva = [...rankingGeral].sort((a, b) => parseFloat(b.pctAtiva) - parseFloat(a.pctAtiva));
      const ordenadoPorQuantidade = [...rankingGeral].sort((a, b) => b.resolvidos - a.resolvidos);

      const posCheia = ordenadoPorCheia.findIndex((a) => a.agente === agente.agente) + 1;
      const posAtiva = ordenadoPorAtiva.findIndex((a) => a.agente === agente.agente) + 1;
      const posQuantidade = ordenadoPorQuantidade.findIndex((a) => a.agente === agente.agente) + 1;

      setRanking({
        posicaoAproveitamento: posCheia,
        posicaoAtiva: posAtiva,
        posicaoQuantidade: posQuantidade,
        total: rankingGeral.length,
      });
    }
  }, [agente, rankingGeral]);

  const faltandoMeta = Math.max(0, 97 - parseFloat(agente.pctAtiva)).toFixed(2);

  const dataPizza = Object.entries(agente.statusDetalhado).map(([status, valor]) => ({
    name: status,
    value: valor,
  }));

  function exportarParaPDF() {
    const elemento = document.querySelector(".sidebar-conteudo");
    const opcoes = {
      margin: 0.4,
      filename: `relatorio-${agente.agente.toLowerCase()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf().set(opcoes).from(elemento).save();
  }

  return (
    <div className="sidebar-overlay" onClick={onClose}>
      <div className="sidebar-conteudo" onClick={(e) => e.stopPropagation()}>
        <button className="fechar" onClick={onClose}>X</button>
        <h2 style={{ color: "#a259ff", marginBottom: "10px" }}>{agente.agente}</h2>

        {ranking.posicaoAproveitamento && (
          <div style={{ color: "#ccc", fontSize: "14px", marginBottom: "12px", textAlign: "left", lineHeight: "1.6" }}>
            <strong style={{ color: "#a259ff" }}>🏆 Ranking do Agente</strong><br />
            • <strong>{ranking.posicaoAproveitamento}º</strong> em <span style={{ color: "#81c784" }}>Carteira Cheia (%)</span><br />
            • <strong>{ranking.posicaoAtiva}º</strong> em <span style={{ color: "#4fc3f7" }}>Somente Ativos (%)</span><br />
            • <strong>{ranking.posicaoQuantidade}º</strong> em <span style={{ color: "#ffc107" }}>Resolvidos (Qtde)</span><br />
            • Base: <strong>{ranking.total}</strong> agentes analisados
          </div>
        )}

        <div className="blocos-metricas-container">
          <div className="bloco-metrica">
            <span className="icone">💼</span>
            <span className="valor">{agente.total}</span>
            <div className="descricao">Total carteira</div>
          </div>
          <div className="bloco-metrica">
            <span className="icone">✅</span>
            <span className="valor">{agente.resolvidos}</span>
            <div className="descricao">Resolvidos por AZ</div>
          </div>
          <div className="bloco-metrica">
            <span className="icone">📈</span>
            <span className="valor">{agente.pctCheia}%</span>
            <div className="descricao">Carteira cheia</div>
          </div>
          <div className="bloco-metrica">
            <span className="icone">📊</span>
            <span className="valor">{agente.pctAtiva}%</span>
            <div className="descricao">Carteira ativa</div>
          </div>
        </div>

        <div className="bloco-status-detalhado">
          {Object.entries(agente.statusDetalhado).sort((a, b) => b[1] - a[1]).map(([status, qtd]) => (
            <div key={status} className="linha-status">
              <span className="status-nome">{status}</span>
              <div className="status-barra-externa">
                <div
                  className={`status-barra-interna ${status}`}
                  style={{ width: `${(qtd / agente.total) * 100}%` }}
                ></div>
              </div>
              <span className="status-quantidade">{qtd}</span>
            </div>
          ))}
        </div>

        {possiveisInacessiveis.length > 0 && (
          <div className="bloco-pendentes">
            <h4>⚠️ Possíveis Inacessíveis</h4>
            <ul>
              {possiveisInacessiveis.map((aluno, index) => {
                const [dia, mes, ano] = aluno.dataMatricula?.split("/") || [];
                const dataMat = new Date(`${ano}-${mes}-${dia}`);
                const dias = Math.floor((new Date() - dataMat) / (1000 * 60 * 60 * 24));
                return (
                  <li key={index} className="pendente-item">
                    <span className="pendente-nome">{aluno.nome}</span>
                    <span className="badge-dias">{dias} dias</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="grafico-pizza">
          <h4 style={{ color: "white", marginBottom: "10px" }}>Distribuição por status</h4>
          <PieChart width={250} height={250}>
            <Pie
              data={dataPizza}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label
            >
              {dataPizza.map((_, i) => (
                <Cell key={`cell-${i}`} fill={cores[i % cores.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        <button className="botao-pdf" onClick={exportarParaPDF}>
          Exportar PDF
        </button>
      </div>
    </div>
  );
}