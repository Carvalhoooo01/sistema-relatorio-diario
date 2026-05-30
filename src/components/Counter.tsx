interface Props {
  value: number;
  onChange: (v: number) => void;
}

export default function Counter({ value, onChange }: Props) {
  const dec = () => onChange(Math.max(0, value - 1));
  const inc = () => onChange(value + 1);

  const btnBase: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: 6,
    border: "1px solid #38383f",
    background: "#1e1e22",
    color: "#6b6b78",
    cursor: "pointer",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all .12s",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <button style={btnBase} onClick={dec}>−</button>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        style={{
          width: 48,
          height: 28,
          textAlign: "center",
          fontFamily: "'DM Mono', monospace",
          fontSize: 14,
          fontWeight: 500,
          background: "#1e1e22",
          border: "1px solid #38383f",
          borderRadius: 6,
          color: value > 0 ? "#c8f564" : "#6b6b78",
          outline: "none",
        }}
      />
      <button style={btnBase} onClick={inc}>+</button>
    </div>
  );
}
