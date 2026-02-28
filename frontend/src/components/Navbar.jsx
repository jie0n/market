import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const dropdownItem = (label, onClick, danger = false) => (
    <button
      onClick={() => { setDropdownOpen(false); onClick(); }}
      style={{
        display: "block", width: "100%", textAlign: "left",
        background: "none", border: "none", cursor: "pointer",
        padding: "10px 16px", fontSize: "13px", fontFamily: "inherit",
        fontWeight: "500", color: danger ? "#e74c3c" : "#111",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = danger ? "#fff5f5" : "#f7f7f7"}
      onMouseLeave={(e) => e.currentTarget.style.background = "none"}
    >
      {label}
    </button>
  );

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid #f0f0f0",
    }}>
      <div style={{
        maxWidth: "1100px", margin: "0 auto",
        padding: "0 24px", height: "58px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* 로고 */}
        <button onClick={() => navigate("/")} style={{
          background: "#111", color: "#fff", border: "none", cursor: "pointer",
          fontSize: "13px", fontWeight: "800", letterSpacing: "-0.03em",
          padding: "4px 10px", borderRadius: "6px", fontFamily: "inherit",
        }}>
          MARKET
        </button>

        {/* 중앙 네비 링크 */}
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <button onClick={() => navigate("/")} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: "14px", fontWeight: isActive("/") ? "700" : "500",
            color: isActive("/") ? "#111" : "#888",
            fontFamily: "inherit", padding: "4px 0",
            borderBottom: isActive("/") ? "2px solid #111" : "2px solid transparent",
            transition: "all 0.15s",
          }}>
            게시물 목록
          </button>
        </div>

        {/* 우측 액션 */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {user ? (
            <div ref={dropdownRef} style={{ position: "relative" }}>
              {/* 닉네임 버튼 */}
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  background: "none", border: "1.5px solid #e0e0e0", cursor: "pointer",
                  fontSize: "13px", fontWeight: "600", padding: "6px 12px",
                  borderRadius: "8px", fontFamily: "inherit", color: "#111",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "#111"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "#e0e0e0"}
              >
                {user.nickname}
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* 드롭다운 메뉴 */}
              {dropdownOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  background: "#fff", borderRadius: "12px",
                  border: "1px solid #f0f0f0",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                  minWidth: "140px", overflow: "hidden", zIndex: 200,
                }}>
                  {dropdownItem("채팅", () => navigate("/chat"))}
                  {dropdownItem("신고 내역", () => navigate("/my-reports"))}
                  <div style={{ height: "1px", background: "#f5f5f5", margin: "2px 0" }} />
                  {dropdownItem("마이페이지", () => navigate("/mypage"))}
                  {dropdownItem("로그아웃", onLogout, true)}
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => navigate("/auth")} style={{
              background: "#111", color: "#fff", border: "none", cursor: "pointer",
              fontSize: "13px", fontWeight: "600", padding: "7px 16px",
              borderRadius: "8px", fontFamily: "inherit",
            }}>
              로그인
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
