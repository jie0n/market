import { useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { postsApi } from "../api";
import { API_BASE } from "../api";
import Button from "../components/Button";
import Input from "../components/Input";
import Alert from "../components/Alert";

export default function PostFormPage({ user }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id } = useParams();

  // 수정 모드면 state.post로 기존 데이터 채움
  const isEdit = !!state?.post;
  const existingPost = state?.post;

  const [title, setTitle] = useState(existingPost?.title || "");
  const [content, setContent] = useState(existingPost?.content || "");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(existingPost?.image_path ? `${API_BASE}${existingPost.image_path}` : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  // 로그인 안 된 경우
  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!title.trim()) return setError("제목을 입력해주세요.");
    if (!content.trim()) return setError("내용을 입력해주세요.");

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image) formData.append("image", image);

      if (isEdit) {
        await postsApi.update(existingPost.id, formData);
      } else {
        await postsApi.create(formData);
      }

      navigate("/");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 24px" }}>

      {/* 헤더 */}
      <div style={{ marginBottom: "28px" }}>
        <button onClick={() => navigate(-1)} style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          background: "none", border: "none", cursor: "pointer",
          fontSize: "13px", color: "#888", fontFamily: "inherit",
          marginBottom: "16px", padding: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          뒤로가기
        </button>
        <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#111", margin: "0 0 4px", letterSpacing: "-0.04em" }}>
          {isEdit ? "게시물 수정" : "게시물 등록"}
        </h1>
        <p style={{ fontSize: "14px", color: "#aaa", margin: 0 }}>
          {isEdit ? "게시물 내용을 수정하세요" : "판매할 상품을 등록해보세요"}
        </p>
      </div>

      <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid #f0f0f0", padding: "28px 32px" }}>
        <Alert message={error} type="error" />

        {/* 제목 */}
        <Input label="제목" value={title} onChange={setTitle} placeholder="상품명을 입력해주세요" />

        {/* 내용 */}
        <Input label="내용" value={content} onChange={setContent} placeholder="상품 설명을 입력해주세요&#10;민감한 정보(전화번호, 계좌번호 등)는 자동으로 필터링됩니다" rows={6} />

        {/* 이미지 업로드 */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#888", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "10px" }}>
            이미지 (선택)
          </label>

          {preview ? (
            <div style={{ position: "relative", display: "inline-block" }}>
              <img src={preview} alt="미리보기"
                style={{ width: "100%", maxHeight: "280px", objectFit: "cover", borderRadius: "12px", border: "1px solid #f0f0f0", display: "block" }}
              />
              <button onClick={handleRemoveImage} style={{
                position: "absolute", top: "10px", right: "10px",
                width: "28px", height: "28px", borderRadius: "50%",
                background: "rgba(0,0,0,0.6)", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
                fontSize: "14px",
              }}>
                ✕
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: "2px dashed #e8e8e8", borderRadius: "12px",
                padding: "40px 20px", textAlign: "center", cursor: "pointer",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#111"; e.currentTarget.style.background = "#fafafa"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e8e8e8"; e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ fontSize: "32px", marginBottom: "10px" }}>🖼️</div>
              <p style={{ fontSize: "14px", color: "#888", margin: "0 0 4px", fontWeight: "500" }}>클릭해서 이미지 업로드</p>
              <p style={{ fontSize: "12px", color: "#bbb", margin: 0 }}>JPG, PNG, GIF 지원</p>
            </div>
          )}

          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />

          {!preview && (
            <button onClick={() => fileRef.current?.click()} style={{
              marginTop: "10px", background: "none", border: "1.5px solid #e0e0e0",
              borderRadius: "8px", padding: "7px 14px", fontSize: "13px",
              color: "#555", cursor: "pointer", fontFamily: "inherit", fontWeight: "500",
            }}>
              파일 선택
            </button>
          )}
        </div>

        {/* 안내 메시지 */}
        <div style={{
          background: "#f8f8f8", borderRadius: "10px", padding: "12px 16px",
          marginBottom: "20px", display: "flex", gap: "10px", alignItems: "flex-start",
        }}>
          <span style={{ fontSize: "16px" }}>🔒</span>
          <p style={{ fontSize: "12px", color: "#888", margin: 0, lineHeight: "1.6" }}>
            전화번호, 계좌번호, 주민등록번호 등 민감한 개인정보는 등록 시 자동으로 마스킹 처리됩니다.
          </p>
        </div>

        {/* 제출 버튼 */}
        <div style={{ display: "flex", gap: "10px" }}>
          <Button variant="outline" onClick={() => navigate(-1)} fullWidth>취소</Button>
          <Button onClick={handleSubmit} loading={loading} fullWidth>
            {isEdit ? "수정 완료" : "등록하기"}
          </Button>
        </div>
      </div>
    </div>
  );
}
