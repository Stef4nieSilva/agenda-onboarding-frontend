import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Inicializa o tema com valor do localStorage ou "claro" como padrão
  const [tema, setTema] = useState(() => {
    const temaSalvo = localStorage.getItem("tema");
    return temaSalvo === "escuro" ? "escuro" : "claro";
  });

  function alternarTema() {
    setTema((temaAtual) => (temaAtual === "claro" ? "escuro" : "claro"));
  }

  useEffect(() => {
    localStorage.setItem("tema", tema);
  }, [tema]);

  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
