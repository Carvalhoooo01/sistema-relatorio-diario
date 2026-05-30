import { useState } from "react";
import { TECNICOS, Tecnico } from "../data/topicos";

interface Props {
  onSelect: (tecnico: Tecnico) => void;
}

export default function TelaLogin({ onSelect }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f11", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#6b6b78", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>
            Realtele Soluções
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
            Relatório Diário
          </h1>
          <p style={{ color: "#6b6b78", fontSize: 14, margin: 0 }}>Selecione seu nome para continuar</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TECNICOS.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t)}
              onMouseEnter={() => setHovered(t.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: hovered === t.id ? "rgba(200,245,100,0.08)" : "#17171a",
                border: hovered === t.id ? "1px solid rgba(200,245,100,0.35)" : "1px solid #2a2a30",
                borderRadius: 12, padding: "16px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: "pointer", transition: "all .18s", width: "100%",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: hovered === t.id ? "rgba(200,245,100,0.15)" : "#1e1e22",
                  border: "1px solid #38383f",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 500,
                  color: hovered === t.id ? "#c8f564" : "#6b6b78", transition: "all .18s",
                }}>
                  {t.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#f0f0f0", margin: 0 }}>{t.nome}</p>
              </div>
              <span style={{ color: hovered === t.id ? "#c8f564" : "#38383f", fontSize: 18, transition: "color .18s" }}>→</span>
            </button>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: "#48484f", marginTop: 32, fontFamily: "'DM Mono', monospace" }}>v1.0.0</p>
      </div>
    </div>
  );
}
