import { useState, useEffect, useCallback } from "react";
import { authApi } from "../api";
import Button from "../components/Button";
import Input from "../components/Input";
import Alert from "../components/Alert";

// ── 섹션 카드 래퍼 ──────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{
      background: "#fff", borderRadius: "16px", border: "1px solid #f0f0f0",
      padding: "28px", marginBottom: "16px",
    }}>
      <div style={{ marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid #f5f5f5" }}>
        <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#111", margin: 0, letterSpacing: "-0.02em" }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

// ── 일반 편집 행 (닉네임, 전화번호) ─────────────────────────
function EditableRow({ label, value, onSave, placeholder, type = "text", isLast = false }) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const open = () => { setEditing(true); setInputVal(""); setError(""); };
  const close = () => { setEditing(false); setInputVal(""); setError(""); };

  const handleSave = async () => {
    if (!inputVal.trim()) return setError("값을 입력해주세요.");
    setLoading(true); setError("");
    try {
      await onSave(inputVal);
      close();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ borderBottom: isLast ? "none" : "1px solid #f9f9f9" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "12px 0" }}>
        <span style={{ fontSize: "13px", color: "#888", minWidth: "80px" }}>{label}</span>
        <span style={{ fontSize: "14px", color: "#111", fontWeight: "500", flex: 1 }}>{value || "-"}</span>
        <Button onClick={open} fullWidth={false} small variant="outline">변경</Button>
      </div>
      {editing && (
        <div style={{ paddingBottom: "12px" }}>
          <Alert message={error} type="error" />
          <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <Input type={type} value={inputVal} onChange={setInputVal} placeholder={placeholder || value || ""} />
            </div>
            <div style={{ marginBottom: "16px", display: "flex", gap: "6px" }}>
              <Button onClick={close} variant="outline" fullWidth={false} small>취소</Button>
              <Button onClick={handleSave} loading={loading} fullWidth={false} small>저장</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 이메일 행 (인증 필요) ─────────────────────────────────────
function EmailRow({ currentEmail, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const close = () => {
    setEditing(false);
    setStep(1); setEmail(""); setCode(""); setError(""); setSuccess("");
  };

  const sendCode = async () => {
    if (!email.trim()) return setError("이메일을 입력해주세요.");
    setLoading(true); setError(""); setSuccess("");
    try {
      await authApi.sendUpdateCode(email);
      setSuccess("인증번호가 발송되었습니다.");
      setStep(2);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const verifyAndUpdate = async () => {
    if (!code.trim()) return setError("인증번호를 입력해주세요.");
    setLoading(true); setError(""); setSuccess("");
    try {
      await authApi.verifyCode(email, code);
      await authApi.updateProfile({ email });
      setSuccess("이메일이 변경되었습니다.");
      onUpdated();
      setTimeout(close, 1500);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ borderBottom: "1px solid #f9f9f9" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "12px 0" }}>
        <span style={{ fontSize: "13px", color: "#888", minWidth: "80px" }}>이메일</span>
        <span style={{ fontSize: "14px", color: "#111", fontWeight: "500", flex: 1 }}>{currentEmail || "-"}</span>
        <Button onClick={() => setEditing(true)} fullWidth={false} small variant="outline">변경</Button>
      </div>
      {editing && (
        <div style={{ paddingBottom: "12px" }}>
          <Alert message={error} type="error" />
          <Alert message={success} type="success" />

          {step === 1 && (
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <Input label="새 이메일" type="email" value={email} onChange={setEmail} placeholder={currentEmail} />
              </div>
              <div style={{ marginBottom: "16px", display: "flex", gap: "6px" }}>
                <Button onClick={close} variant="outline" fullWidth={false} small>취소</Button>
                <Button onClick={sendCode} loading={loading} fullWidth={false} small>인증번호 받기</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <>
              <div style={{ fontSize: "13px", color: "#888", marginBottom: "12px" }}>
                <strong style={{ color: "#111" }}>{email}</strong>으로 발송된 인증번호를 입력하세요
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <Input label="인증번호" value={code} onChange={setCode} placeholder="6자리 입력" />
                </div>
                <div style={{ marginBottom: "16px", display: "flex", gap: "6px" }}>
                  <Button onClick={close} variant="outline" fullWidth={false} small>취소</Button>
                  <Button onClick={sendCode} loading={loading} variant="outline" fullWidth={false} small>재발송</Button>
                  <Button onClick={verifyAndUpdate} loading={loading} fullWidth={false} small>확인</Button>
                </div>
              </div>
              <button onClick={() => { setStep(1); setError(""); setSuccess(""); }}
                style={{ background: "none", border: "none", color: "#aaa", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
                ← 이메일 변경
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── 비밀번호 행 ───────────────────────────────────────────────
function PasswordRow() {
  const [editing, setEditing] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const close = () => { setEditing(false); setPassword(""); setConfirm(""); setError(""); setSuccess(""); };

  const handleUpdate = async () => {
    if (!password) return setError("새 비밀번호를 입력해주세요.");
    if (password !== confirm) return setError("비밀번호가 일치하지 않습니다.");
    if (password.length < 6) return setError("비밀번호는 6자 이상이어야 합니다.");
    setLoading(true); setError(""); setSuccess("");
    try {
      await authApi.updateProfile({ password });
      setSuccess("비밀번호가 변경되었습니다.");
      setTimeout(close, 1500);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", padding: "12px 0" }}>
        <span style={{ fontSize: "13px", color: "#888", minWidth: "80px" }}>비밀번호</span>
        <span style={{ fontSize: "14px", color: "#bbb", flex: 1 }}>••••••••</span>
        <Button onClick={() => setEditing(true)} fullWidth={false} small variant="outline">변경</Button>
      </div>
      {editing && (
        <div style={{ paddingBottom: "12px" }}>
          <Alert message={error} type="error" />
          <Alert message={success} type="success" />
          <Input label="새 비밀번호" type="password" value={password} onChange={setPassword} placeholder="6자 이상" />
          <Input label="비밀번호 확인" type="password" value={confirm} onChange={setConfirm} placeholder="비밀번호 다시 입력" />
          <div style={{ display: "flex", gap: "8px" }}>
            <Button onClick={close} variant="outline" fullWidth={false} small>취소</Button>
            <Button onClick={handleUpdate} loading={loading} fullWidth={false} small>저장</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatPhone(phone) {
  if (!phone) return null;
  const d = phone.replace(/\D/g, "");
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return phone;
}

// ══════════════════════════════════════════════════════════
// MyPage 메인
// ══════════════════════════════════════════════════════════
export default function MyPage({ onUserUpdate }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const data = await authApi.getMe();
      setUser(data);
      if (onUserUpdate) onUserUpdate(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [onUserUpdate]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
        <div style={{ width: "28px", height: "28px", border: "3px solid #e0e0e0", borderTopColor: "#111", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 24px" }}>

      {/* 헤더 */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#111", margin: "0 0 4px", letterSpacing: "-0.04em" }}>
          마이페이지
        </h1>
        <p style={{ fontSize: "14px", color: "#aaa", margin: 0 }}>계정 정보를 관리하세요</p>
      </div>

      <Section title="내 정보">
        <EditableRow
          label="닉네임"
          value={user?.nickname}
          onSave={async (val) => { await authApi.updateProfile({ nickname: val }); fetchUser(); }}
          placeholder="새 닉네임"
        />
        <EditableRow
          label="전화번호"
          value={formatPhone(user?.phone)}
          onSave={async (val) => { await authApi.updateProfile({ phone: val }); fetchUser(); }}
        />
        <EmailRow currentEmail={user?.email} onUpdated={fetchUser} />
        <PasswordRow />
      </Section>

    </div>
  );
}
