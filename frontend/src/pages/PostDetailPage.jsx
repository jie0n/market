import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { postsApi } from "../api";
import { API_BASE } from "../api";
import Button from "../components/Button";
import Alert from "../components/Alert";

// ── 신고 모달 ───────────────────────────────────────────────
function ReportModal({ onClose, onSubmit, loading }) {
  const [reason, setReason] = useState("");

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}
      onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: "16px", padding: "28px",
        width: "100%", maxWidth: "400px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}
        onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", margin: "0 0 6px" }}>게시물 신고</h3>
        <p style={{ fontSize: "13px", color: "#aaa", margin: "0 0 18px" }}>신고 사유를 입력해주세요</p>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)}
          placeholder="신고 사유를 구체적으로 작성해주세요"
          rows={4}
          style={{
            width: "100%", padding: "12px 14px", border: "1.5px solid #e8e8e8",
            borderRadius: "10px", fontSize: "14px", fontFamily: "inherit",
            resize: "none", outline: "none", boxSizing: "border-box", color: "#111",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#111")}
          onBlur={(e) => (e.target.style.borderColor = "#e8e8e8")}
        />
        <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
          <Button variant="outline" onClick={onClose} fullWidth>취소</Button>
          <Button variant="danger" onClick={() => onSubmit(reason)} loading={loading} fullWidth>신고하기</Button>
        </div>
      </div>
    </div>
  );
}

// ── 삭제 확인 모달 ──────────────────────────────────────────
function DeleteModal({ onClose, onConfirm, loading }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}
      onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: "16px", padding: "28px",
        width: "100%", maxWidth: "360px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>🗑️</div>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", margin: "0 0 6px" }}>게시물을 삭제할까요?</h3>
          <p style={{ fontSize: "13px", color: "#aaa", margin: 0 }}>삭제한 게시물은 복구할 수 없어요</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="outline" onClick={onClose} fullWidth>취소</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading} fullWidth>삭제</Button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// PostDetailPage
// ══════════════════════════════════════════════════════════
export default function PostDetailPage({ user }) {
  useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  // MainPage에서 state로 post 데이터 넘어옴
  const post = state?.post;

  const [showReport, setShowReport] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imgError, setImgError] = useState(false);

  // post 데이터 없으면 목록으로
  if (!post) {
    navigate("/");
    return null;
  }

  const isOwner = user && user.id === post.user_id;

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await postsApi.delete(post.id);
      navigate("/");
    } catch (e) {
      setError(e.message);
      setShowDelete(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleReport = async (reason) => {
    if (!reason.trim()) return;
    setReportLoading(true);
    try {
      await postsApi.report(post.id, reason);
      setSuccess("신고가 접수되었습니다.");
      setShowReport(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <>
      {showReport && <ReportModal onClose={() => setShowReport(false)} onSubmit={handleReport} loading={reportLoading} />}
      {showDelete && <DeleteModal onClose={() => setShowDelete(false)} onConfirm={handleDelete} loading={deleteLoading} />}

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 24px" }}>

        {/* 뒤로가기 */}
        <button onClick={() => navigate(-1)} style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          background: "none", border: "none", cursor: "pointer",
          fontSize: "13px", color: "#888", fontFamily: "inherit",
          marginBottom: "24px", padding: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          목록으로
        </button>

        <Alert message={error} type="error" />
        <Alert message={success} type="success" />

        {/* 메인 카드 */}
        <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid #f0f0f0", overflow: "hidden" }}>

          {/* 이미지 */}
          {post.image_path && !imgError && (
            <div style={{ width: "100%", background: "#f7f7f7" }}>
              <img
                src={`${API_BASE}${post.image_path}`}
                alt={post.title}
                onError={() => setImgError(true)}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          )}

          <div style={{ padding: "28px 32px" }}>

            {/* 작성자 + 액션 버튼 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%", background: "#111",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", color: "#fff", fontWeight: "700",
                }}>
                  {post.nickname?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#111" }}>{post.nickname}</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#aaa" }}>판매자</p>
                </div>
              </div>

              {/* 버튼 영역 */}
              <div style={{ display: "flex", gap: "8px" }}>
                {isOwner ? (
                  <>
                    <Button
                      variant="outline" small fullWidth={false}
                      onClick={() => navigate(`/posts/${post.id}/edit`, { state: { post } })}>
                      수정
                    </Button>
                    <Button
                      variant="danger" small fullWidth={false}
                      onClick={() => setShowDelete(true)}>
                      삭제
                    </Button>
                  </>
                ) : user ? (
                  <Button
                    variant="outline" small fullWidth={false}
                    onClick={() => setShowReport(true)}>
                    신고
                  </Button>
                ) : null}
              </div>
            </div>

            {/* 제목 */}
            <h1 style={{
              fontSize: "22px", fontWeight: "800", color: "#111",
              margin: "0 0 16px", letterSpacing: "-0.03em", lineHeight: "1.4",
            }}>
              {post.title}
            </h1>

            {/* 구분선 */}
            <div style={{ height: "1px", background: "#f5f5f5", marginBottom: "20px" }} />

            {/* 내용 */}
            <p style={{ fontSize: "15px", color: "#333", lineHeight: "1.8", margin: "0 0 28px", whiteSpace: "pre-wrap" }}>
              {post.content.split(/((?:https?:\/\/|www\.)[^\s]+)/g).map((part, i) =>
                /^(?:https?:\/\/|www\.)/.test(part) ? (
                  <a key={i}
                    href={part.startsWith("http") ? part : `https://${part}`}
                    target="_blank" rel="noreferrer"
                    style={{ color: "#2980b9", textDecoration: "underline", wordBreak: "break-all" }}>
                    {part}
                  </a>
                ) : part
              )}
            </p>

            {/* 채팅 버튼 (본인 글 아닐 때만) */}
            {!isOwner && user && (
              <Button onClick={() => navigate("/chat", { state: { targetUser: { id: post.user_id, nickname: post.nickname } } })}>
                💬 {post.nickname}님과 채팅하기
              </Button>
            )}

            {/* 비로그인 시 */}
            {!user && (
              <button onClick={() => navigate("/auth")} style={{
                width: "100%", padding: "13px", background: "#f5f5f5",
                border: "none", borderRadius: "10px", fontSize: "14px",
                color: "#888", cursor: "pointer", fontFamily: "inherit", fontWeight: "500",
              }}>
                로그인하고 채팅하기
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
