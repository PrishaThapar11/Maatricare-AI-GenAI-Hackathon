export default function AICard({ title, subtitle, children, accent = "#ec4899" }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "24px",
        borderRadius: "16px",
        marginTop: "20px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        borderLeft: `4px solid ${accent}`,
      }}
    >
      {title && (
        <h3
          style={{
            color: accent,
            fontSize: "20px",
            marginBottom: subtitle ? "4px" : "16px",
          }}
        >
          {title}
        </h3>
      )}

      {subtitle && (
        <p
          style={{
            fontSize: "13px",
            color: "#9ca3af",
            marginBottom: "16px",
          }}
        >
          {subtitle}
        </p>
      )}

      {children}
    </div>
  );
}