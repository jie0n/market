from models import Post, User, Report  # <-- Report가 추가되었습니다.
from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from sqlalchemy.orm import Session
import os, shutil, uuid
from database import get_db
from auth import get_current_user
from filtering import mask_sensitive_info
from watermark import apply_watermark

router = APIRouter(prefix="/posts", tags=["posts"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/")
def create_post(
    title: str = Form(...),
    content: str = Form(...),
    image: UploadFile | None = File(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    image_path = None
    if image:
        ext = os.path.splitext(image.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        apply_watermark(file_path, user.nickname)
        image_path = f"/uploads/{filename}"

    safe_title = mask_sensitive_info(title)
    safe_content = mask_sensitive_info(content)

    post = Post(
        title=safe_title,
        content=safe_content,
        image_path=image_path,
        user_id=user.id
    )

    db.add(post)
    db.commit()
    db.refresh(post)

    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "image_path": post.image_path,
        "user_id": user.id,
        "nickname": user.nickname
    }

@router.get("/")
def get_posts(db: Session = Depends(get_db)):
    posts = db.query(Post).order_by(Post.id.desc()).all()
    result = []
    for p in posts:
        author = db.query(User).filter(User.id == p.user_id).first()
        result.append({
            "id": p.id,
            "title": p.title,
            "content": p.content,
            "image_path": p.image_path,
            "user_id": p.user_id,
            "nickname": author.nickname if author else "알 수 없음"
        })
    return result

@router.put("/{post_id}")
def update_post(
    post_id: int,
    title: str = Form(...),
    content: str = Form(...),
    image: UploadFile | None = File(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="게시글 없음")
    if post.user_id != user.id:
        raise HTTPException(status_code=403, detail="수정 권한 없음")

    if image:
        if post.image_path:
            old_path = post.image_path.lstrip("/")
            if os.path.exists(old_path):
                os.remove(old_path)
        ext = os.path.splitext(image.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        apply_watermark(file_path, user.nickname)
        post.image_path = f"/uploads/{filename}"

    post.title = mask_sensitive_info(title)
    post.content = mask_sensitive_info(content)
    db.commit()
    db.refresh(post)
    return {"message": "게시글 수정 완료"}

@router.delete("/{post_id}")
def delete_post(post_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="게시글 없음")
    if post.user_id != user.id:
        raise HTTPException(status_code=403, detail="삭제 권한 없음")

    if post.image_path:
        file_path = post.image_path.lstrip("/")
        if os.path.exists(file_path):
            os.remove(file_path)

    db.delete(post)
    db.commit()
    return {"message": "게시글 삭제 완료"}

@router.post("/{post_id}/report")
def report_post(
    post_id: int,
    reason: str = Form(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="게시글 없음")

    if post.user_id == user.id:
        raise HTTPException(status_code=400, detail="자기 자신은 신고할 수 없음")

    report = Report(
        reporter_id=user.id,
        reported_user_id=post.user_id,
        post_id=post.id,
        reason=reason
    )

    db.add(report)
    db.commit()

    return {"message": "신고 접수 완료"}

@router.get("/reports/my")
def get_my_reports(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reports = db.query(Report).filter(Report.reporter_id == user.id).all()

    result = []
    for r in reports:
        reported_user = db.query(User).filter(User.id == r.reported_user_id).first()
        result.append({
            "id": r.id,
            "post_id": r.post_id,
            "reported_user_id": r.reported_user_id,
            "reported_user_nickname": reported_user.nickname if reported_user else "알 수 없음",
            "reason": r.reason,
            "created_at": r.created_at.isoformat()
        })
    return result