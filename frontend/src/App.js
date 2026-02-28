import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { authApi } from "./api";
import Navbar from "./components/Navbar";
import AuthPage from "./pages/AuthPage";
import MainPage from "./pages/MainPage";
import MyPage from "./pages/MyPage";
import PostDetailPage from "./pages/PostDetailPage";
import PostFormPage from "./pages/PostFormPage";
import ChatPage from "./pages/ChatPage";
import MyReportsPage from "./pages/MyReportsPage";

// 로그인 필요 라우트
function PrivateRoute({ user, children }) {
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 앱 시작 시 토큰으로 유저 정보 복원
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      authApi.getMe()
        .then(setUser)
        .catch(() => localStorage.removeItem("access_token"))
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  const handleLogin = () => {
    authApi.getMe().then(setUser).catch(console.error);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "32px", height: "32px", border: "3px solid #e0e0e0", borderTopColor: "#111", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ fontSize: "13px", color: "#aaa", fontFamily: "sans-serif" }}>불러오는 중...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700;800&display=swap');
        `}</style>

        {/* 로그인 페이지에서는 Navbar 숨김 */}
        <Routes>
          <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
          <Route path="/*" element={
            <>
              <Navbar user={user} onLogout={handleLogout} />
              <Routes>
                <Route path="/" element={<MainPage user={user} />} />
                <Route path="/posts/:id" element={<PostDetailPage user={user} />} />
                <Route path="/posts/new" element={
                  <PrivateRoute user={user}>
                    <PostFormPage user={user} />
                  </PrivateRoute>
                } />
                <Route path="/posts/:id/edit" element={
                  <PrivateRoute user={user}>
                    <PostFormPage user={user} />
                  </PrivateRoute>
                } />
                <Route path="/chat" element={
                  <PrivateRoute user={user}>
                    <ChatPage user={user} />
                  </PrivateRoute>
                } />
                <Route path="/mypage" element={
                  <PrivateRoute user={user}>
                    <MyPage onUserUpdate={setUser} />
                  </PrivateRoute>
                } />
                <Route path="/my-reports" element={
                  <PrivateRoute user={user}>
                    <MyReportsPage />
                  </PrivateRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
