import { useState } from "react";

const LoadingSpinner = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    style={{ animation: "spin 0.8s linear infinite" }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default function Button({ children, onClick, loading, variant = "primary", disabled, small, type = "button", fullWidth = true }) {
  const [hovered, setHovered] = useState(false);

  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
    width: (!small && fullWidth) ? "100%" : "auto",
    padding: small ? "7px 14px" : "13px 20px",
    borderRadius: "10px",
    fontSize: small ? "12px" : "14px",
    fontWeight: "600",
    cursor: (disabled || loading) ? "not-allowed" : "pointer",
    opacity: (disabled || loading) ? 0.5 : hovered ? 0.82 : 1,
    transition: "all 0.18s",
    fontFamily: "inherit",
    letterSpacing: "0.01em",
    whiteSpace: "nowrap",
    border: "none",
  };

  const variants = {
    primary: { background: "#111", color: "#fff" },
    outline: { background: "transparent", color: "#111", border: "1.5px solid #e0e0e0" },
    ghost:   { background: hovered ? "#f5f5f5" : "transparent", color: "#555", border: "none" },
    danger:  { background: "#fff0f0", color: "#c0392b", border: "1.5px solid #f5c6cb" },
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      style={{ ...base, ...variants[variant] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      {loading ? <LoadingSpinner /> : children}
    </button>
  );
}
