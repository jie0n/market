import { useState, useEffect } from "react";
import { postsApi } from "../api";

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function ReportCard({ report }) {
  const isPostReport = report.post_id !== null;

  return (
    <div style={{
      background: "#fff", borderRadius: "14px", border: "1px solid #f0f0f0",
      padding: "20px 24px", display: "flex", flexDirection: "column", gap: "10px",
    }}>
      {/* 상단: 유형 + 날짜 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontSize: "11px", fontWeight: "700", letterSpacing: "0.04em",
          color: isPostReport ? "#e67e22" : "#3498db",
          background: isPostReport ? "#fff8f0" : "#f0f6ff",
          border: `1px solid ${isPostReport ? "#f5cba7" : "#aed6f1"}`,
          borderRadius: "6px", padding: "3px 9px",
        }}>
          {isPostReport ? "게시물 신고" : "채팅 유저 신고"}
        </span>
        <span style={{ fontSize: "12px", color: "#bbb" }}>{formatDate(report.created_at)}</span>
      </div>

      {/* 신고 대상 */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <span style={{ fontSize: "12px", color: "#aaa", minWidth: "60px" }}>신고 대상</span>
        <span style={{ fontSize: "13px", color: "#555" }}>
          {report.reported_user_nickname}
          {isPostReport && (
            <span style={{ color: "#bbb", marginLeft: "8px" }}>· 게시물 #{report.post_id}</span>
          )}
        </span>
      </div>

      {/* 신고 사유 */}
      <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
        <span style={{ fontSize: "12px", color: "#aaa", minWidth: "60px", paddingTop: "1px" }}>신고 사유</span>
        <span style={{
          fontSize: "13px", color: "#333", lineHeight: "1.5",
          background: "#fafafa", borderRadius: "8px", padding: "8px 12px", flex: 1,
        }}>
          {report.reason}
        </span>
      </div>
    </div>
  );
}

export default function MyReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    postsApi.getMyReports()
      .then(setReports)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 24px" }}>
      {/* 헤더 */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#111", margin: "0 0 4px", letterSpacing: "-0.04em" }}>
          신고 내역
        </h1>
        <p style={{ fontSize: "14px", color: "#aaa", margin: 0 }}>내가 접수한 신고 목록입니다</p>
      </div>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <div style={{ width: "28px", height: "28px", border: "3px solid #e0e0e0", borderTopColor: "#111", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {error && (
        <div style={{ background: "#fff5f5", border: "1px solid #fcc", borderRadius: "10px", padding: "14px 18px", color: "#c0392b", fontSize: "13px" }}>
          {error}
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#bbb" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>📋</div>
          <p style={{ fontSize: "15px", fontWeight: "600", color: "#ccc", margin: "0 0 4px" }}>신고 내역이 없습니다</p>
          <p style={{ fontSize: "13px", color: "#ddd", margin: 0 }}>접수된 신고가 여기에 표시됩니다</p>
        </div>
      )}

      {!loading && !error && reports.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "13px", color: "#aaa", marginBottom: "4px" }}>
            총 <strong style={{ color: "#111" }}>{reports.length}</strong>건
          </div>
          {reports.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </div>
      )}
    </div>
  );
}
