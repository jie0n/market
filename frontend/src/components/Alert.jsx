export default function Alert({ message, type = "error" }) {
  if (!message) return null;

  const styles = {
    error:   { bg: "#fff0f0", color: "#c0392b", border: "#f5c6cb" },
    success: { bg: "#f0fff4", color: "#27ae60", border: "#c3e6cb" },
    info:    { bg: "#f0f7ff", color: "#2980b9", border: "#bee3f8" },
  };

  const s = styles[type] || styles.error;

  return (
    <div style={{
      padding: "11px 14px", borderRadius: "10px", fontSize: "13px",
      marginBottom: "16px", background: s.bg, color: s.color,
      border: `1px solid ${s.border}`, lineHeight: "1.5",
    }}>
      {message}
    </div>
  );
}
