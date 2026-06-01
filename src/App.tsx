import { useState, useEffect } from "react";
import { Tecnico } from "./data/topicos";
import TelaLogin from "./components/TelaLogin";
import TelaRelatorio from "./components/TelaRelatorio";

export default function App() {
  // Inicializa o estado tentando buscar o técnico que já estava logado no localStorage
  const [tecnico, setTecnico] = useState<Tecnico | null>(() => {
    const tecnicoSalvo = localStorage.getItem("colaborador_logado");
    if (tecnicoSalvo) {
      try {
        return JSON.parse(tecnicoSalvo);
      } catch (e) {
        console.error("Erro ao ler técnico do localStorage", e);
      }
    }
    return null;
  });

  // Função para fazer o login e prender no navegador
  const handleLogin = (t: Tecnico) => {
    setTecnico(t);
    localStorage.setItem("colaborador_logado", JSON.stringify(t));
  };

  // Função para fazer o logout e apagar do navegador
  const handleLogout = () => {
    setTecnico(null);
    localStorage.removeItem("colaborador_logado");
  };

  // Se não estiver logado, renderiza a TelaLogin
  if (!tecnico) {
    return <TelaLogin onLogin={handleLogin} />;
  }

  // Se estiver logado, renderiza a TelaRelatorio
  return <TelaRelatorio tecnico={tecnico} onLogout={handleLogout} />;
}