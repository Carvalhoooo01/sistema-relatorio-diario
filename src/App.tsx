import { useState } from "react";
import { Tecnico } from "./data/topicos";
import TelaLogin from "./components/TelaLogin";
import TelaRelatorio from "./components/TelaRelatorio";

export default function App() {
  const [tecnico, setTecnico] = useState<Tecnico | null>(null);

  if (!tecnico) {
    return <TelaLogin onSelect={setTecnico} />;
  }

  return <TelaRelatorio tecnico={tecnico} onLogout={() => setTecnico(null)} />;
}
