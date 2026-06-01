import { useState } from "react";
import { Tecnico } from "./data/topicos";
import TelaLogin from "./components/TelaLogin";
import TelaRelatorio from "./components/TelaRelatorio";

export default function App() {
  const [tecnico, setTecnico] = useState<Tecnico | null>(null);

  // Se não estiver logado, damos o 'return' renderizando a TelaLogin
  if (!tecnico) {
    return <TelaLogin onLogin={(t: Tecnico) => setTecnico(t)} />;
  }

  // Se estiver logado, o React chega aqui e renderiza a TelaRelatorio
  return <TelaRelatorio tecnico={tecnico} onLogout={() => setTecnico(null)} />;
}