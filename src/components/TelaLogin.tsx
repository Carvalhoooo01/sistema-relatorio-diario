import React, { useState } from "react";
import { Tecnico } from "../data/topicos";

// Criamos a lista de técnicos mockados diretamente aqui com a nova tipagem
const LISTA_TECNICOS: Tecnico[] = [
  { id: "1", nome: "Gustavo Carvalho" },
  { id: "2", nome: "Maria Eduarda" }
];

interface TelaLoginProps {
  onLogin: (tecnico: Tecnico) => void;
}

export default function TelaLogin({ onLogin }: TelaLoginProps) {
  const [nomeBusca, setNomeBusca] = useState("");

  // Tipando explicitamente o parâmetro 't' como Tecnico
  const tecnicosFiltrados = LISTA_TECNICOS.filter((t: Tecnico) =>
    t.nome.toLowerCase().includes(nomeBusca.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Procura o técnico na lista tipando o parâmetro 'n' como Tecnico
    const encontrado = LISTA_TECNICOS.find(
      (n: Tecnico) => n.nome.toLowerCase() === nomeBusca.trim().toLowerCase()
    );

    if (encontrado) {
      onLogin(encontrado);
    } else {
      alert("Nome não encontrado! Digite seu nome completo cadastrado.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: "24px", background: "#17171a", border: "1px solid #2a2a30", borderRadius: 16, color: "#f0f0f0" }}>
      <h2 style={{ textAlign: "center", marginBottom: 24, fontSize: 20 }}>Acessar o Sistema</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, color: "#6b6b78", marginBottom: 8, textTransform: "uppercase" }}>Nome Completo</label>
          <input
            type="text"
            placeholder="Ex: Gustavo Carvalho"
            value={nomeBusca}
            onChange={(e) => setNomeBusca(e.target.value)}
            list="tecnicos-list"
            style={{ width: "100%", background: "#1e1e22", border: "1px solid #38383f", borderRadius: 8, padding: "10px 12px", color: "#f0f0f0", fontSize: 14 }}
            required
          />
          <datalist id="tecnicos-list">
            {tecnicosFiltrados.map((t: Tecnico) => (
              <option key={t.id} value={t.nome} />
            ))}
          </datalist>
        </div>
        <button type="submit" style={{ width: "100%", padding: "12px", background: "#c8f564", color: "#0f0f11", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Entrar no Painel
        </button>
      </form>
    </div>
  );
}