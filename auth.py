from dotenv import load_dotenv
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

import random
import smtplib
from datetime import datetime, timedelta, timezone

from jose import jwt, JWTError
from fastapi import APIRouter, Depends, HTTPException, status, Request, Form
from sqlalchemy.orm import Session
from email.mime.text import MIMEText
from passlib.context import CryptContext

from database import get_db
from models import User, EmailVerification

router = APIRouter(prefix="/auth", tags=["auth"])

# ---------------- JWT 설정 ----------------
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 1

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------------- 토큰 생성 ----------------
def create_access_token(user_id: int):
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> int:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return int(user_id)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# ---------------- 이메일 인증 ----------------
GMAIL_ID = os.getenv("GMAIL_ID") 
GMAIL_PASSWORD = os.getenv("GMAIL_PASSWORD") 

def generate_code():
    return str(random.randint(100000, 999999))

def send_email_verification(email: str, code: str):
    msg = MIMEText(f"인증번호는 {code} 입니다.")
    msg["Subject"] = "이메일 인증번호"
    msg["From"] = GMAIL_ID
    msg["To"] = email

    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    server.login(GMAIL_ID, GMAIL_PASSWORD)
    server.sendmail(GMAIL_ID, [email], msg.as_string())
    server.quit()

@router.post("/send-code")
async def send_code(email: str = Form(...), db: Session = Depends(get_db)):
    code = generate_code()

    verification = EmailVerification(email=email, code=code)
    db.add(verification)
    db.commit()

    send_email_verification(email, code)

    return {"message": "인증번호 발송 완료"}

@router.post("/verify-code")
def verify_code(email: str = Form(...), code: str = Form(...), db: Session = Depends(get_db)):
    record = db.query(EmailVerification)\
               .filter_by(email=email, code=code)\
               .first()

    if not record:
        raise HTTPException(status_code=400, detail="인증번호가 올바르지 않습니다.")

    return {"message": "인증 성공"}

# ---------------- 회원가입 ----------------
@router.post("/register")
def register(
    nickname: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):

    verified = db.query(EmailVerification)\
                 .filter(EmailVerification.email == email)\
                 .first()

    if not verified:
        raise HTTPException(status_code=400, detail="이메일 인증을 먼저 완료하세요")

    if db.query(User).filter(User.nickname == nickname).first():
        raise HTTPException(status_code=400, detail="이미 존재하는 닉네임입니다")

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="이미 존재하는 이메일입니다")

    hashed_password = pwd_context.hash(password)

    user = User(
        nickname=nickname,
        email=email,
        phone=phone,
        password=hashed_password,
        is_verified=True
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    db.delete(verified)
    db.commit()

    access_token = create_access_token(user.id)

    return {"access_token": access_token, "token_type": "bearer"}

# ---------------- 로그인 ----------------
@router.post("/login")
def login(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()

    if not user or not pwd_context.verify(password, user.password):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다")

    access_token = create_access_token(user.id)
    return {"access_token": access_token, "token_type": "bearer"}

# ---------------- 현재 유저 ----------------
def get_current_user(request: Request, db: Session = Depends(get_db)):
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = auth_header.split(" ")[1]
    user_id = verify_token(token)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user
