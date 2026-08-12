from typing import Optional, List, Tuple
from uuid import UUID
from sqlalchemy.orm import Session
from app.users.models import User
from app.common.enums import UserRole

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: UUID) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def list_paginated(
        self, 
        skip: int = 0, 
        limit: int = 10, 
        role: Optional[UserRole] = None, 
        search: Optional[str] = None
    ) -> Tuple[List[User], int]:
        query = self.db.query(User)
        if role:
            query = query.filter(User.role == role)
        if search:
            query = query.filter(
                (User.name.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
            )
        total = query.count()
        users = query.order_by(User.name.asc()).offset(skip).limit(limit).all()
        return users, total

    def update(self, user: User, update_data: dict) -> User:
        for key, value in update_data.items():
            if value is not None:
                setattr(user, key, value)
        self.db.commit()
        self.db.refresh(user)
        return user
