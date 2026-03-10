from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone, timedelta
from database import Base

KST = timezone(timedelta(hours=9))

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    nickname = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone = Column(String(20), nullable=False)
    password = Column(String(200), nullable=False)
    is_verified = Column(Boolean, default=False)

    posts = relationship("Post", back_populates="author")
    sent_messages = relationship("Message", foreign_keys='Message.sender_id', back_populates="sender")
    received_messages = relationship("Message", foreign_keys='Message.receiver_id', back_populates="receiver")


class EmailVerification(Base):
    __tablename__ = "email_verifications"

    id = Column(Integer, primary_key=True)
    email = Column(String(100), index=True)
    code = Column(String(6))


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100))
    content = Column(Text)
    image_path = Column(String(255), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    author = relationship("User", back_populates="posts")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)

    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))

    created_at = Column(DateTime, default=lambda: datetime.now(KST))

    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"))
    reported_user_id = Column(Integer, ForeignKey("users.id"))
    post_id = Column(Integer, ForeignKey("posts.id"))
    reason = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(KST))

    reporter = relationship("User", foreign_keys=[reporter_id])
    reported_user = relationship("User", foreign_keys=[reported_user_id])
    post = relationship("Post")