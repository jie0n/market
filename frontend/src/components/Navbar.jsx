import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLink = (label, path) => (
    <button onClick={() => navigate(path)} style={{
      background: "none", border: "none", cursor: "pointer",
      fontSize: "14px", fontWeight: isActive(path) ? "700" : "500",
      color: isActive(path) ? "#111" : "#888",
      fontFamily: "inherit", padding: "4px 0",
      borderBottom: isActive(path) ? "2px solid #111" : "2px solid transparent",
      transition: "all 0.15s",
    }}>
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

        {/* 네비 링크 - 마이페이지 → 게시물 목록으로 교체 */}
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          {navLink("게시물 목록", "/")}
          {user && navLink("채팅", "/chat")}
        </div>

        {/* 우측 액션 */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {user ? (
            <>
              <span style={{ fontSize: "13px", color: "#888" }}>
                <strong style={{ color: "#111" }}>{user.nickname}</strong>님
              </span>
              {/* + 글쓰기 → 마이페이지로 교체 */}
              <button onClick={() => navigate("/mypage")} style={{
                background: "#111", color: "#fff", border: "none", cursor: "pointer",
                fontSize: "13px", fontWeight: "600", padding: "7px 14px",
                borderRadius: "8px", fontFamily: "inherit",
              }}>
                마이페이지
              </button>
              <button onClick={onLogout} style={{
                background: "none", border: "1.5px solid #e0e0e0", cursor: "pointer",
                fontSize: "13px", fontWeight: "500", padding: "6px 12px",
                borderRadius: "8px", fontFamily: "inherit", color: "#888",
              }}>
                로그아웃
              </button>
            </>
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
