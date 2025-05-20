// src/RankingGrafico.jsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

export default function RankingGrafico({ dados, tipo }) {
  const corPrimaria = ["#a259ff", "#b88af9", "#c6b4f2"];
  const dadosOrdenados = [...dados].sort((a, b) =>
    tipo === "quantidade"
      ? b.resolvidos - a.resolvidos
      : b.pctCarteiraAtiva - a.pctCarteiraAtiva
  ).slice(0, 3);

  const renderTickComMedalha = ({ x, y, payload, index }) => {
    const medalhas = ["🥇", "🥈", "🥉"];
    return (
      <text
        x={x}
        y={y + 5}
        textAnchor="end"
        fill="#fff"
        fontSize={14}
        fontWeight="bold"
      >
        {medalhas[index] || ""} {payload.value}
      </text>
    );
  };

  return (
    <div style={{ textAlign: "center", margin: "20px" }}>
      {/* TÍTULO VISUAL */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "#a259ff",
            letterSpacing: "0.5px",
            textTransform: "uppercase"
          }}
        >
          {tipo === "quantidade" ? "Mais Resolvidos" : "Melhor Aproveitamento"}
        </div>
        <div style={{ fontSize: "14px", color: "#ccc", marginTop: "2px" }}>
          {tipo === "quantidade" ? "(Quantidade)" : "(%)"}
        </div>
        <div
          style={{
            height: "3px",
            width: "40px",
            backgroundColor: "#a259ff",
            margin: "6px auto 0",
            borderRadius: "2px"
          }}
        ></div>
      </div>

      {/* GRÁFICO */}
      <ResponsiveContainer width={400} height={220}>
        <BarChart
          data={dadosOrdenados}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 80 }}
        >
          <XAxis type="number" hide />
          <YAxis
            dataKey="agente"
            type="category"
            tick={renderTickComMedalha}
          />
          <Tooltip />
          <Bar
            dataKey={tipo === "quantidade" ? "resolvidos" : "pctCarteiraAtiva"}
            radius={[8, 8, 8, 8]}
            label={{
              position: "insideRight",
              fill: "#fff",
              fontWeight: "bold",
              offset: 10
            }}
          >
            {dadosOrdenados.map((_, i) => (
              <Cell key={i} fill={corPrimaria[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
