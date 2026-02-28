import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postsApi, API_BASE } from "../api";

// ── 스켈레톤 카드 ───────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: "#fff", borderRadius: "14px", overflow: "hidden", border: "1px solid #f0f0f0" }}>
      <div style={{ height: "180px", background: "linear-gradient(90deg, #f5f5f5 25%, #ececec 50%, #f5f5f5 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
      <div style={{ padding: "16px" }}>
        <div style={{ height: "14px", background: "#f0f0f0", borderRadius: "6px", marginBottom: "10px" }} />
        <div style={{ height: "12px", background: "#f5f5f5", borderRadius: "6px", width: "60%" }} />
      </div>
    </div>
  );
}

// ── 게시물 카드 ─────────────────────────────────────────────
function PostCard({ post, onClick }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div onClick={onClick} style={{
      background: "#fff", borderRadius: "14px", overflow: "hidden",
      border: "1px solid #f0f0f0", cursor: "pointer",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>

      {/* 이미지 영역 */}
      <div style={{ height: "180px", background: "#f7f7f7", overflow: "hidden", position: "relative" }}>
        {post.image_path && !imgError ? (
          <img src={`${API_BASE}${post.image_path}`} alt={post.title}
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
      </div>

      {/* 텍스트 영역 */}
      <div style={{ padding: "14px 16px 16px" }}>
        <h3 style={{
          margin: "0 0 6px", fontSize: "14px", fontWeight: "600", color: "#111",
          lineHeight: "1.4", overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {post.title}
        </h3>
        <p style={{
          margin: "0 0 12px", fontSize: "13px", color: "#888", lineHeight: "1.5",
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {post.content}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{
            width: "22px", height: "22px", borderRadius: "50%", background: "#111",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "10px", color: "#fff", fontWeight: "700", flexShrink: 0,
          }}>
            {post.nickname?.[0]?.toUpperCase() || "?"}
          </div>
          <span style={{ fontSize: "12px", color: "#999" }}>{post.nickname}</span>
        </div>
      </div>
    </div>
  );
}

// ── 빈 상태 ─────────────────────────────────────────────────
function EmptyState({ onWrite, user }) {
  const navigate = useNavigate();
  return (
    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "80px 20px" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>🛍️</div>
      <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
        아직 게시물이 없어요
      </h3>
      <p style={{ fontSize: "14px", color: "#aaa", margin: "0 0 24px" }}>첫 번째 거래를 시작해보세요!</p>
      {user && (
        <button onClick={onWrite} style={{
          background: "#111", color: "#fff", border: "none", cursor: "pointer",
          fontSize: "14px", fontWeight: "600", padding: "11px 24px",
          borderRadius: "10px", fontFamily: "inherit",
        }}>
          + 글쓰기
        </button>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MainPage
// ══════════════════════════════════════════════════════════
export default function MainPage({ user }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    postsApi.getAll()
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.content.toLowerCase().includes(search.toLowerCase()) ||
    p.nickname.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>

        {/* 왼쪽: 타이틀 + 검색창 */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#111", margin: "0 0 4px", letterSpacing: "-0.04em" }}>
              중고 마켓
            </h1>
            <p style={{ fontSize: "14px", color: "#aaa", margin: 0 }}>
              {loading ? "불러오는 중..." : `총 ${posts.length}개의 상품`}
            </p>
          </div>

          {/* 검색창 */}
          <div style={{ position: "relative" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="제목, 내용, 닉네임 검색"
              style={{
                paddingLeft: "36px", paddingRight: "14px", paddingTop: "10px", paddingBottom: "10px",
                border: "1.5px solid #e8e8e8", borderRadius: "10px", fontSize: "13px",
                outline: "none", fontFamily: "inherit", width: "220px", color: "#111",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#111")}
              onBlur={(e) => (e.target.style.borderColor = "#e8e8e8")}
            />
          </div>
        </div>

        {/* 오른쪽: 글쓰기 버튼 */}
        {user && (
          <button onClick={() => navigate("/posts/new")} style={{
            background: "#111", color: "#fff", border: "none", cursor: "pointer",
            fontSize: "13px", fontWeight: "600", padding: "10px 18px",
            borderRadius: "8px", fontFamily: "inherit", whiteSpace: "nowrap",
          }}>
            + 글쓰기
          </button>
        )}
      </div>

      {/* 게시물 그리드 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
        gap: "18px",
      }}>
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <EmptyState onWrite={() => navigate("/posts/new")} user={user} />
        ) : (
          filtered.map((post) => (
            <PostCard key={post.id} post={post} onClick={() => navigate(`/posts/${post.id}`, { state: { post } })} />
          ))
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
