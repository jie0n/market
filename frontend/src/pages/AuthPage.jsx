import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api";
import Button from "../components/Button";
import Input from "../components/Input";
import Alert from "../components/Alert";

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ── 로그인 폼 ───────────────────────────────────────────────
function LoginForm({ onSuccess, onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) return setError("이메일과 비밀번호를 입력해주세요.");
    setLoading(true); setError("");
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem("access_token", data.access_token);
      onSuccess();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div style={{ marginBottom: "30px" }}>
        <h1 style={styles.title}>환영합니다!</h1>
        <p style={styles.subtitle}>계정에 로그인하세요</p>
      </div>
      <Alert message={error} type="error" />
      <Input label="이메일" type="email" value={email} onChange={setEmail} placeholder="example@email.com" />
      <Input label="비밀번호" type="password" value={password} onChange={setPassword} placeholder="비밀번호 입력" />
      <Button onClick={handleLogin} loading={loading}>로그인</Button>
      <p style={styles.switchText}>
        계정이 없으신가요?{" "}
        <span onClick={onSwitch} style={styles.switchLink}>회원가입</span>
      </p>
    </>
  );
}

// ── 회원가입 폼 (3단계) ─────────────────────────────────────
function RegisterForm({ onSuccess, onSwitch }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [verified, setVerified] = useState(false);

  const stepLabels = ["이메일 인증", "코드 확인", "정보 입력"];

  const sendCode = async () => {
    if (!email) return setError("이메일을 입력해주세요.");
    setLoading(true); setError(""); setSuccess("");
    try {
      await authApi.sendCode(email);
      setSuccess("인증번호가 발송되었습니다. 이메일을 확인해주세요.");
      setStep(2);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const verifyCode = async () => {
    if (!code) return setError("인증번호를 입력해주세요.");
    setLoading(true); setError(""); setSuccess("");
    try {
      await authApi.verifyCode(email, code);
      setVerified(true);
      setSuccess("인증이 완료되었습니다!");
      setTimeout(() => { setSuccess(""); setStep(3); }, 700);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const register = async () => {
    if (!nickname || !phone || !password) return setError("모든 항목을 입력해주세요.");
    if (password !== passwordConfirm) return setError("비밀번호가 일치하지 않습니다.");
    setLoading(true); setError("");
    try {
      const data = await authApi.register({ nickname, email, phone, password });
      localStorage.setItem("access_token", data.access_token);
      onSuccess();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={styles.title}>계정 만들기</h1>
        <p style={{ ...styles.subtitle, marginBottom: "20px" }}>중고 거래를 시작해보세요</p>

        {/* 스텝 인디케이터 */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {stepLabels.map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: i < stepLabels.length - 1 ? 1 : "none" }}>
              <div style={{
                width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: i + 1 <= step ? "#111" : "#f0f0f0",
                color: i + 1 <= step ? "#fff" : "#bbb",
                fontSize: "11px", fontWeight: "700", transition: "all 0.3s",
              }}>
                {i + 1 < step ? <CheckIcon /> : i + 1}
              </div>
              <span style={{ fontSize: "11px", marginLeft: "6px", fontWeight: i + 1 === step ? "600" : "400", color: i + 1 === step ? "#111" : "#bbb", whiteSpace: "nowrap" }}>
                {label}
              </span>
              {i < stepLabels.length - 1 && (
                <div style={{ flex: 1, height: "1px", background: i + 1 < step ? "#111" : "#e8e8e8", margin: "0 10px", transition: "all 0.3s" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <Alert message={error} type="error" />
      <Alert message={success} type="success" />

      {step === 1 && (
        <>
          <Input label="이메일" type="email" value={email} onChange={setEmail} placeholder="인증받을 이메일 주소" />
          <Button onClick={sendCode} loading={loading}>인증번호 받기</Button>
        </>
      )}

      {step === 2 && (
        <>
          <Input label="이메일" type="email" value={email} onChange={() => {}} disabled />
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#888", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "6px" }}>
              인증번호
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)}
                placeholder="6자리" maxLength={6}
                style={{ flex: 1, padding: "11px 14px", border: "1.5px solid #e8e8e8", borderRadius: "10px", fontSize: "16px", letterSpacing: "0.3em", outline: "none", fontFamily: "inherit", color: "#111" }}
                onFocus={(e) => (e.target.style.borderColor = "#111")}
                onBlur={(e) => (e.target.style.borderColor = "#e8e8e8")}
              />
              <Button onClick={sendCode} loading={loading} variant="outline" small fullWidth={false}>재발송</Button>
            </div>
          </div>
          <Button onClick={verifyCode} loading={loading} disabled={verified}>
            {verified ? "✓ 인증 완료" : "인증하기"}
          </Button>
          <button onClick={() => { setStep(1); setError(""); setSuccess(""); }}
            style={{ display: "block", background: "none", border: "none", color: "#aaa", fontSize: "13px", cursor: "pointer", margin: "12px auto 0", fontFamily: "inherit" }}>
            ← 이메일 변경
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <Input label="닉네임" value={nickname} onChange={setNickname} placeholder="사용할 닉네임" />
          <Input label="전화번호" value={phone} onChange={setPhone} placeholder="010-0000-0000" />
          <Input label="비밀번호" type="password" value={password} onChange={setPassword} placeholder="8자 이상 권장" />
          <Input label="비밀번호 확인" type="password" value={passwordConfirm} onChange={setPasswordConfirm} placeholder="비밀번호 다시 입력" />
          <Button onClick={register} loading={loading}>가입 완료</Button>
        </>
      )}

      <p style={styles.switchText}>
        이미 계정이 있으신가요?{" "}
        <span onClick={onSwitch} style={styles.switchLink}>로그인</span>
      </p>
    </>
  );
}

// ══════════════════════════════════════════════════════════
// AuthPage
// ══════════════════════════════════════════════════════════
export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const navigate = useNavigate();

  const handleSuccess = () => {
    onLogin();
    navigate("/");
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div style={styles.pageWrapper}>
        <div style={{ position: "fixed", top: "-100px", right: "-100px", width: "320px", height: "320px", borderRadius: "50%", background: "radial-gradient(circle, #f0f0f0, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "fixed", bottom: "-80px", left: "-80px", width: "260px", height: "260px", borderRadius: "50%", background: "radial-gradient(circle, #f5f5f5, transparent 70%)", pointerEvents: "none" }} />

        <div style={styles.card}>
          <div style={{ marginBottom: "28px" }}>
            <span style={{ background: "#111", color: "#fff", fontSize: "13px", fontWeight: "800", letterSpacing: "-0.03em", padding: "4px 10px", borderRadius: "6px" }}>
              MARKET
            </span>
          </div>

          <div key={mode} style={{ animation: "fadeUp 0.3s ease forwards" }}>
            {mode === "login"
              ? <LoginForm onSuccess={handleSuccess} onSwitch={() => setMode("register")} />
              : <RegisterForm onSuccess={handleSuccess} onSwitch={() => setMode("login")} />
            }
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh", background: "#fafafa",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "24px", fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  card: {
    background: "#fff", borderRadius: "20px", padding: "40px",
    width: "100%", maxWidth: "420px",
    boxShadow: "0 2px 20px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0",
  },
  title: { fontSize: "26px", fontWeight: "700", color: "#111", margin: "0 0 6px", letterSpacing: "-0.03em" },
  subtitle: { fontSize: "14px", color: "#888", margin: 0 },
  switchText: { textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#888" },
  switchLink: { color: "#111", fontWeight: "600", cursor: "pointer", textDecoration: "underline" },
};
