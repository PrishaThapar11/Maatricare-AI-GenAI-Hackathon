export default function RiskBadge({ level }) {
  if (!level) return null;

  // ✅ NORMALIZE
  const normalizedLevel = level.toLowerCase();
  
  const styles = {
    low: {
      backgroundColor: "#e6f4ea",
      color: "#137333",
      border: "1px solid #34a853",
    },
    mid: {
      backgroundColor: "#fff4e5",
      color: "#b45309",
      border: "1px solid #f59e0b",
    },
    high: {
      backgroundColor: "#fdecea",
      color: "#b91c1c",
      border: "1px solid #ef4444",
    },
  };

  // ❗ SAFETY CHECK
  if (!styles[normalizedLevel]) {
    console.warn("Unknown risk level:", level);
    return null;
  }

  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "600",
        textTransform: "uppercase",
        display: "inline-block",
        ...styles[normalizedLevel],
      }}
    >
      {normalizedLevel}
    </span>
  );
}

