import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { chatApi } from "../api";
import Button from "../components/Button";
import Alert from "../components/Alert";

// ── 신고 모달 ───────────────────────────────────────────────
function ReportModal({ target, onClose, onSubmit, loading }) {
  const [reason, setReason] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
      onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
        onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", margin: "0 0 6px" }}>{target?.nickname}님 신고</h3>
        <p style={{ fontSize: "13px", color: "#aaa", margin: "0 0 18px" }}>신고 사유를 입력해주세요</p>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)}
          placeholder="신고 사유를 구체적으로 작성해주세요" rows={4}
          style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e8e8e8", borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", resize: "none", outline: "none", boxSizing: "border-box", color: "#111" }}
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

// ── 유저 아바타 ─────────────────────────────────────────────
function Avatar({ nickname, size = 36 }) {
  return (
    <div style={{
      width: `${size}px`, height: `${size}px`, borderRadius: "50%", background: "#111",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: `${size * 0.36}px`, color: "#fff", fontWeight: "700", flexShrink: 0,
    }}>
      {nickname?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// ChatPage
// ══════════════════════════════════════════════════════════
export default function ChatPage({ user }) {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(state?.targetUser || null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [usersLoading, setUsersLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [error, setError] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const pollRef = useRef(null);

  // 유저 목록 로드
  useEffect(() => {
    chatApi.getUsers()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setUsersLoading(false));
  }, []);

  // 메시지 로드 + 폴링 (3초마다 자동 갱신)
  useEffect(() => {
    if (!selectedUser) return;

    const loadMessages = async () => {
      try {
        const data = await chatApi.getMessages(selectedUser.id);
        setMessages(data);
      } catch (e) {
        console.error(e);
      }
    };

    setMsgLoading(true);
    loadMessages().finally(() => setMsgLoading(false));

    pollRef.current = setInterval(loadMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [selectedUser]);

  // 메시지 맨 아래로 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setMessages([]);
    setError("");
    setReportSuccess("");
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedUser) return;
    const content = input.trim();
    setInput("");
    setSendLoading(true);
    try {
      const msg = await chatApi.sendMessage(selectedUser.id, content);
      setMessages((prev) => [...prev, msg]);
    } catch (e) {
      setError(e.message);
      setInput(content);
    } finally {
      setSendLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReport = async (reason) => {
    if (!reason.trim()) return;
    setReportLoading(true);
    try {
      await chatApi.reportUser(selectedUser.id, reason);
      setReportSuccess(`${selectedUser.nickname}님을 신고했습니다.`);
      setShowReport(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setReportLoading(false);
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {showReport && <ReportModal target={selectedUser} onClose={() => setShowReport(false)} onSubmit={handleReport} loading={reportLoading} />}

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px", height: "calc(100vh - 58px)", display: "flex", gap: "16px" }}>

        {/* ── 왼쪽: 유저 목록 ── */}
        <div style={{ width: "260px", flexShrink: 0, background: "#fff", borderRadius: "16px", border: "1px solid #f0f0f0", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid #f5f5f5" }}>
            <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#111", margin: 0, letterSpacing: "-0.02em" }}>채팅</h2>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {usersLoading ? (
              <div style={{ padding: "20px", textAlign: "center" }}>
                <div style={{ width: "20px", height: "20px", border: "2px solid #e0e0e0", borderTopColor: "#111", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
              </div>
            ) : users.length === 0 ? (
              <div style={{ padding: "32px 20px", textAlign: "center" }}>
                <p style={{ fontSize: "13px", color: "#bbb", margin: 0 }}>대화 가능한 유저가 없어요</p>
              </div>
            ) : (
              users.map((u) => (
                <div key={u.id} onClick={() => handleSelectUser(u)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px 20px", cursor: "pointer",
                    background: selectedUser?.id === u.id ? "#f8f8f8" : "transparent",
                    borderLeft: selectedUser?.id === u.id ? "3px solid #111" : "3px solid transparent",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { if (selectedUser?.id !== u.id) e.currentTarget.style.background = "#fafafa"; }}
                  onMouseLeave={(e) => { if (selectedUser?.id !== u.id) e.currentTarget.style.background = "transparent"; }}
                >
                  <Avatar nickname={u.nickname} size={34} />
                  <span style={{ fontSize: "14px", fontWeight: selectedUser?.id === u.id ? "600" : "500", color: "#111" }}>
                    {u.nickname}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── 오른쪽: 채팅창 ── */}
        <div style={{ flex: 1, background: "#fff", borderRadius: "16px", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {selectedUser ? (
            <>
              {/* 채팅 헤더 */}
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Avatar nickname={selectedUser.nickname} size={34} />
                  <div>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#111" }}>{selectedUser.nickname}</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>3초마다 자동 갱신</p>
                  </div>
                </div>
                <button onClick={() => setShowReport(true)} style={{
                  background: "none", border: "1.5px solid #f0f0f0", borderRadius: "8px",
                  padding: "6px 12px", fontSize: "12px", color: "#aaa", cursor: "pointer",
                  fontFamily: "inherit", fontWeight: "500",
                }}>
                  신고
                </button>
              </div>

              {/* 메시지 영역 */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <Alert message={error} type="error" />
                <Alert message={reportSuccess} type="success" />

                {msgLoading && messages.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <div style={{ width: "20px", height: "20px", border: "2px solid #e0e0e0", borderTopColor: "#111", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <p style={{ fontSize: "14px", color: "#bbb", margin: "0 0 4px" }}>아직 메시지가 없어요</p>
                    <p style={{ fontSize: "13px", color: "#ddd", margin: 0 }}>먼저 인사를 건네보세요 👋</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} style={{ display: "flex", flexDirection: isMine ? "row-reverse" : "row", alignItems: "flex-end", gap: "8px" }}>
                        {!isMine && <Avatar nickname={msg.sender_nickname} size={28} />}
                        <div style={{ maxWidth: "65%", display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start", gap: "3px" }}>
                          <div style={{
                            padding: "10px 14px", borderRadius: isMine ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                            background: isMine ? "#111" : "#f5f5f5",
                            color: isMine ? "#fff" : "#111",
                            fontSize: "14px", lineHeight: "1.5", wordBreak: "break-word",
                          }}>
                            {msg.content}
                          </div>
                          <span style={{ fontSize: "11px", color: "#bbb" }}>{formatTime(msg.created_at)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 입력창 */}
              <div style={{ padding: "16px 24px", borderTop: "1px solid #f5f5f5", display: "flex", gap: "10px", alignItems: "flex-end" }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="메시지를 입력하세요 (Enter로 전송)"
                  rows={1}
                  style={{
                    flex: 1, padding: "11px 14px", border: "1.5px solid #e8e8e8",
                    borderRadius: "10px", fontSize: "14px", fontFamily: "inherit",
                    resize: "none", outline: "none", color: "#111", lineHeight: "1.5",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#111")}
                  onBlur={(e) => (e.target.style.borderColor = "#e8e8e8")}
                />
                <Button onClick={handleSend} loading={sendLoading} disabled={!input.trim()} small fullWidth={false}>
                  전송
                </Button>
              </div>
            </>
          ) : (
            // 유저 미선택 상태
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#bbb" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
              <p style={{ fontSize: "15px", fontWeight: "500", color: "#888", margin: "0 0 6px" }}>대화할 상대를 선택하세요</p>
              <p style={{ fontSize: "13px", color: "#bbb", margin: 0 }}>왼쪽 목록에서 유저를 클릭하세요</p>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
