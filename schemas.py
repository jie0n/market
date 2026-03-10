from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    nickname: str
    password: str


class PostCreate(BaseModel):
    title: str
    content: str


class PostUpdate(BaseModel):
    title: str
    content: str


class PostPatch(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
