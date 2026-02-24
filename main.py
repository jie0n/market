from dotenv import load_dotenv
import os
from fastapi import HTTPException, FastAPI, Request, Depends, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from database import Base, engine, get_db
from models import Message, User
from auth import get_current_user, router as auth_router
from posts import router as posts_router
from models import Report
from filtering import mask_sensitive_info

load_dotenv()
API_KEY = os.getenv("SAFE_BROWSING_API_KEY")
app = FastAPI()

# 라우터 등록 (기존 기능 유지)
app.include_router(auth_router)
app.include_router(posts_router)

# DB 생성
Base.metadata.create_all(bind=engine)

# 템플릿
templates = Jinja2Templates(directory="templates")

# 업로드 폴더
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# =========================
# 메인 페이지
# =========================
@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# =========================
# 모든 유저 목록 (채팅용)
# =========================
@app.get("/users")
def get_users(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)  # 🔥 int 유지
):
    users = db.query(User).all()

    return [
        {"id": u.id, "username": u.username}
        for u in users
        if u.id != current_user
    ]

# =========================
# 1:1 채팅 조회
# =========================
@app.get("/chat/{user_id}")
def get_chat(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)  # 🔥 int 유지
):
    messages = db.query(Message).filter(
        (
            (Message.sender_id == current_user) &
            (Message.receiver_id == user_id)
        ) |
        (
            (Message.sender_id == user_id) &
            (Message.receiver_id == current_user)
        )
    ).order_by(Message.created_at.asc()).all()

    result = []
    for m in messages:
        sender = db.query(User).filter(User.id == m.sender_id).first()

        result.append({
            "id": m.id,
            "sender_id": m.sender_id,
            "sender_username": sender.username if sender else "Unknown",
            "receiver_id": m.receiver_id,
            "content": m.content,
            "created_at": m.created_at.isoformat()
        })

    return result

# =========================
# 1:1 채팅 전송
# =========================
@app.post("/chat/{user_id}")
def send_message(
    user_id: int,
    content: str = Form(...),
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)  # 🔥 int 유지
):
    if user_id == current_user:
        return {"error": "자기 자신에게는 보낼 수 없습니다."}

    safe_content = mask_sensitive_info(content)

    msg = Message(
    sender_id=current_user,
    receiver_id=user_id,
    content=content #채팅에서는 개인정보 그대로 보낼 수 있게
)

    db.add(msg)
    db.commit()
    db.refresh(msg)

    sender = db.query(User).filter(User.id == current_user).first()

    return {
        "id": msg.id,
        "sender_id": msg.sender_id,
        "sender_username": sender.username if sender else "Unknown",
        "receiver_id": msg.receiver_id,
        "content": msg.content,
        "created_at": msg.created_at.isoformat()
    }


# =========================
# 채팅 상대 신고
# =========================
@app.post("/chat/report/{target_user_id}")
def report_chat_user(
    target_user_id: int,
    reason: str = Form(...),
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    if target_user_id == current_user:
        raise HTTPException(status_code=400, detail="자기 자신은 신고할 수 없음")

    target = db.query(User).filter(User.id == target_user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="해당 유저 없음")

    report = Report(
        reporter_id=current_user,
        reported_user_id=target_user_id,
        post_id=None,   # 🔥 채팅 신고는 post_id 없음
        reason=reason
    )

    db.add(report)
    db.commit()

    return {"message": "채팅 유저 신고 완료"}