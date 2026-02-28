import { useState } from "react";

const EyeIcon = ({ open }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {open ? (
      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
    ) : (
      <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" /></>
    )}
  </svg>
);

export default function Input({ label, type = "text", value, onChange, placeholder, disabled, suffix, rows }) {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPw ? "text" : "password") : type;

  const baseStyle = {
    width: "100%", border: `1.5px solid ${focused ? "#111" : "#e8e8e8"}`,
    borderRadius: "10px", fontSize: "14px", color: "#111",
    background: disabled ? "#f9f9f9" : "#fff",
    outline: "none", transition: "border-color 0.2s",
    boxSizing: "border-box", fontFamily: "inherit",
    resize: rows ? "vertical" : undefined,
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      {label && (
        <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#888", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "6px" }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {rows ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            rows={rows} disabled={disabled}
            style={{ ...baseStyle, padding: "11px 14px" }}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
        ) : (
          <input type={inputType} value={value} onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder} disabled={disabled}
            style={{ ...baseStyle, padding: `11px ${isPassword || suffix ? "42px" : "14px"} 11px 14px` }}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
        )}
        {isPassword && (
          <button type="button" onClick={() => setShowPw(!showPw)}
            style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: 0 }}>
            <EyeIcon open={showPw} />
          </button>
        )}
        {suffix && !isPassword && (
          <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}>{suffix}</div>
        )}
      </div>
    </div>
  );
}
