import { useState, useEffect, useCallback } from "react";
import { authApi } from "../api";
import Button from "../components/Button";
import Input from "../components/Input";
import Alert from "../components/Alert";

// ── 섹션 카드 래퍼 ──────────────────────────────────────────
function Section({ title, description, children }) {
  return (
    <div style={{
      background: "#fff", borderRadius: "16px", border: "1px solid #f0f0f0",
      padding: "28px", marginBottom: "16px",
    }}>
      <div style={{ marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid #f5f5f5" }}>
        <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#111", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          {title}
        </h2>
        {description && <p style={{ fontSize: "13px", color: "#aaa", margin: 0 }}>{description}</p>}
      </div>
      {children}
    </div>
  );
}

// ── 정보 행 (읽기 전용) ─────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f9f9f9" }}>
      <span style={{ fontSize: "13px", color: "#888", minWidth: "80px" }}>{label}</span>
      <span style={{ fontSize: "14px", color: "#111", fontWeight: "500" }}>{value || "-"}</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// 닉네임 수정
// ══════════════════════════════════════════════════════════
function NicknameSection({ currentNickname, onUpdated }) {
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpdate = async () => {
    if (!nickname.trim()) return setError("닉네임을 입력해주세요.");
    if (nickname === currentNickname) return setError("현재 닉네임과 동일합니다.");
    setLoading(true); setError(""); setSuccess("");
    try {
      await authApi.updateProfile({ nickname });
      setSuccess("닉네임이 변경되었습니다.");
      onUpdated();
      setNickname("");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <Section title="닉네임 변경" description="다른 사용자에게 보여지는 이름입니다">
      <Alert message={error} type="error" />
      <Alert message={success} type="success" />
      <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <Input label="새 닉네임" value={nickname} onChange={setNickname} placeholder={currentNickname} />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <Button onClick={handleUpdate} loading={loading} fullWidth={false}>변경</Button>
        </div>
      </div>
    </Section>
  );
}

// ══════════════════════════════════════════════════════════
// 전화번호 수정
// ══════════════════════════════════════════════════════════
function PhoneSection({ currentPhone, onUpdated }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpdate = async () => {
    if (!phone.trim()) return setError("전화번호를 입력해주세요.");
    setLoading(true); setError(""); setSuccess("");
    try {
      await authApi.updateProfile({ phone });
      setSuccess("전화번호가 변경되었습니다.");
      onUpdated();
      setPhone("");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <Section title="전화번호 변경">
      <Alert message={error} type="error" />
      <Alert message={success} type="success" />
      <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <Input label="새 전화번호" value={phone} onChange={setPhone} placeholder={currentPhone || "010-0000-0000"} />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <Button onClick={handleUpdate} loading={loading} fullWidth={false}>변경</Button>
        </div>
      </div>
    </Section>
  );
}

// ══════════════════════════════════════════════════════════
// 이메일 수정 (인증 필요)
// ══════════════════════════════════════════════════════════
function EmailSection({ currentEmail, onUpdated }) {
  const [step, setStep] = useState(1); // 1: 이메일입력, 2: 코드입력
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      // 코드 인증
      await authApi.verifyCode(email, code);
      // 이메일 업데이트
      await authApi.updateProfile({ email });
      setSuccess("이메일이 변경되었습니다.");
      setVerified(true);
      onUpdated();
      setTimeout(() => { setStep(1); setEmail(""); setCode(""); setVerified(false); setSuccess(""); }, 1500);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <Section title="이메일 변경" description="변경 시 이메일 인증이 필요합니다">
      <Alert message={error} type="error" />
      <Alert message={success} type="success" />

      {step === 1 && (
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <Input label="새 이메일" type="email" value={email} onChange={setEmail} placeholder={currentEmail} />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <Button onClick={sendCode} loading={loading} fullWidth={false}>인증번호 받기</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <>
          <div style={{ fontSize: "13px", color: "#888", marginBottom: "12px" }}>
            <strong style={{ color: "#111" }}>{email}</strong>으로 발송된 인증번호를 입력하세요
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <Input label="인증번호" value={code} onChange={setCode} placeholder="6자리 입력" />
            </div>
            <div style={{ marginBottom: "16px", display: "flex", gap: "6px" }}>
              <Button onClick={sendCode} loading={loading} variant="outline" fullWidth={false}>재발송</Button>
              <Button onClick={verifyAndUpdate} loading={loading} disabled={verified} fullWidth={false}>확인</Button>
            </div>
          </div>
          <button onClick={() => { setStep(1); setError(""); setSuccess(""); }}
            style={{ background: "none", border: "none", color: "#aaa", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
            ← 이메일 변경
          </button>
        </>
      )}
    </Section>
  );
}

// ══════════════════════════════════════════════════════════
// 비밀번호 변경
// ══════════════════════════════════════════════════════════
function PasswordSection() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpdate = async () => {
    if (!password) return setError("새 비밀번호를 입력해주세요.");
    if (password !== confirm) return setError("비밀번호가 일치하지 않습니다.");
    if (password.length < 6) return setError("비밀번호는 6자 이상이어야 합니다.");
    setLoading(true); setError(""); setSuccess("");
    try {
      await authApi.updateProfile({ password });
      setSuccess("비밀번호가 변경되었습니다.");
      setPassword(""); setConfirm("");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <Section title="비밀번호 변경">
      <Alert message={error} type="error" />
      <Alert message={success} type="success" />
      <Input label="새 비밀번호" type="password" value={password} onChange={setPassword} placeholder="6자 이상" />
      <Input label="비밀번호 확인" type="password" value={confirm} onChange={setConfirm} placeholder="비밀번호 다시 입력" />
      <Button onClick={handleUpdate} loading={loading}>비밀번호 변경</Button>
    </Section>
  );
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

      {/* 현재 정보 */}
      <Section title="현재 정보">
        <InfoRow label="닉네임" value={user?.nickname} />
        <InfoRow label="이메일" value={user?.email} />
        <InfoRow label="전화번호" value={user?.phone} />
      </Section>

      {/* 수정 섹션들 */}
      <NicknameSection currentNickname={user?.nickname} onUpdated={fetchUser} />
      <PhoneSection currentPhone={user?.phone} onUpdated={fetchUser} />
      <EmailSection currentEmail={user?.email} onUpdated={fetchUser} />
      <PasswordSection />
    </div>
  );
}
