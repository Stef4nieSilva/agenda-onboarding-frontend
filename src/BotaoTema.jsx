import React from "react";
import { useTheme } from "./ThemeContext";

export default function BotaoTema() {
  const { tema, alternarTema } = useTheme();

  return (
    <button
      className="botao-tema"
      onClick={alternarTema}
      aria-label={`Alternar para tema ${tema === "claro" ? "escuro" : "claro"}`}
      type="button"
    >
      {tema === "claro" ? "🌙" : "☀️"}
    </button>
  );
}