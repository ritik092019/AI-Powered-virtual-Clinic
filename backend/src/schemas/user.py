from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from database.models.enums import UserRole

class UserBase(BaseModel):
    name: str
    email: str
    role: UserRole
    phone: Optional[str] = None
    language: Optional[str] = "en"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    language: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class PasswordChangeSchema(BaseModel):
    old_password: str
    new_password: str

class RefreshTokenSchema(BaseModel):
    refresh_token: str

class UserResponse(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenSchema(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse
