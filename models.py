from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    posts = relationship("Post", back_populates="author")
    sent_messages = relationship("Message", foreign_keys='Message.sender_id', back_populates="sender")
    received_messages = relationship("Message", foreign_keys='Message.receiver_id', back_populates="receiver")


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

    created_at = Column(DateTime, default=datetime.utcnow)

    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"))      # 신고한 사람
    reported_user_id = Column(Integer, ForeignKey("users.id")) # 신고당한 사람
    post_id = Column(Integer, ForeignKey("posts.id"))          # 해당 게시글
    reason = Column(Text)                                      # 신고 내용
    created_at = Column(DateTime, default=datetime.utcnow)

    reporter = relationship("User", foreign_keys=[reporter_id])
    reported_user = relationship("User", foreign_keys=[reported_user_id])
    post = relationship("Post")