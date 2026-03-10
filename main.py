from dotenv import load_dotenv
import os
from fastapi import HTTPException, FastAPI, Request, Depends, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from database import Base, engine, get_db
from models import Message, User, Report
from auth import get_current_user, router as auth_router, pwd_context
from posts import router as posts_router
from filtering import mask_sensitive_info

load_dotenv()
API_KEY = os.getenv("SAFE_BROWSING_API_KEY")
app = FastAPI()

# 라우터 등록
app.include_router(auth_router)
app.include_router(posts_router)

# DB 생성
Base.metadata.create_all(bind=engine)

# 템플릿 및 정적 파일 설정
templates = Jinja2Templates(directory="templates")
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# =========================
# 메인 페이지 및 회원가입 페이지
# =========================
@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/register", response_class=HTMLResponse)
def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

# =========================
# 회원정보 수정 페이지
# =========================
@app.get("/account", response_class=HTMLResponse)
def account_page(request: Request):
    return templates.TemplateResponse("account.html", {"request": request})

# =========================
# 내 정보 가져오기 API
# =========================
@app.get("/auth/me")
def get_my_info(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "nickname": current_user.nickname,
        "email": current_user.email,
        "phone": current_user.phone
    }

# =========================
# [수정] 정보수정 전용 이메일 중복체크 및 발송 API
# =========================
@app.post("/auth/update/send-code")
async def send_update_code(
    email: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. 중복 체크: 입력한 이메일이 타인의 것인지 확인
    if email != current_user.email:
        exists = db.query(User).filter(User.email == email).first()
        if exists:
            raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다.")
    
    # 2. auth.py의 send_code 함수를 직접 호출 (db 세션을 명시적으로 전달)
    from auth import send_code
    # 팁: send_code는 async 함수이므로 await를 붙여야 하며, db 객체를 직접 넘깁니다.
    return await send_code(email=email, db=db)

# =========================
# 회원정보 업데이트 API
# =========================
@app.put("/auth/update")
def update_profile(
    name: str = Form(None),
    nickname: str = Form(None),
    phone: str = Form(None),
    password: str = Form(None),
    email: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    if name:
        current_user.name = name

    if nickname:
        exists = db.query(User).filter(User.nickname == nickname, User.id != current_user.id).first()
        if exists:
            raise HTTPException(status_code=400, detail="이미 사용 중인 닉네임입니다.")
        current_user.nickname = nickname

    if phone:
        current_user.phone = phone

    if password:
        current_user.password = pwd_context.hash(password)

    if email and email != current_user.email:
        exists = db.query(User).filter(User.email == email, User.id != current_user.id).first()
        if exists:
            raise HTTPException(status_code=400, detail="이미 등록된 이메일입니다.")
        current_user.email = email

    db.commit()
    return {"message": "회원 정보가 수정되었습니다."}

# =========================
# 모든 유저 목록 (채팅용)
# =========================
@app.get("/users")
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sent = db.query(Message.receiver_id)\
             .filter(Message.sender_id == current_user.id)

    received = db.query(Message.sender_id)\
                 .filter(Message.receiver_id == current_user.id)

    user_ids = {u[0] for u in sent.union(received).all()}

    users = db.query(User).filter(User.id.in_(user_ids)).all()

    return [
        {"id": u.id, "nickname": u.nickname}
        for u in users
    ]

# =========================
# 1:1 채팅 조회
# =========================
@app.get("/chat/{user_id}")
def get_chat(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    messages = db.query(Message).filter(
        (
            (Message.sender_id == current_user.id) &
            (Message.receiver_id == user_id)
        ) |
        (
            (Message.sender_id == user_id) &
            (Message.receiver_id == current_user.id)
        )
    ).order_by(Message.created_at.asc()).all()

    result = []
    for m in messages:
        sender = db.query(User).filter(User.id == m.sender_id).first()
        result.append({
            "id": m.id,
            "sender_id": m.sender_id,
            "sender_nickname": sender.nickname if sender else "Unknown",
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
    current_user: User = Depends(get_current_user)
):
    if user_id == current_user.id:
        return {"error": "자기 자신에게는 보낼 수 없습니다."}

    msg = Message(
        sender_id=current_user.id,
        receiver_id=user_id,
        content=content 
    )

    db.add(msg)
    db.commit()
    db.refresh(msg)

    return {
        "id": msg.id,
        "sender_id": msg.sender_id,
        "sender_nickname": current_user.nickname,
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
    current_user: User = Depends(get_current_user)
):
    if target_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="자기 자신은 신고할 수 없음")

    target = db.query(User).filter(User.id == target_user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="해당 유저 없음")

    report = Report(
        reporter_id=current_user.id,
        reported_user_id=target_user_id,
        post_id=None,
        reason=reason
    )

    db.add(report)
    db.commit()

    return {"message": "채팅 유저 신고 완료"}