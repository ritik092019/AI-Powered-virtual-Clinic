import uuid
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from src.modules.users.repository import UserRepository
from src.schemas.user import UserResponse, UserUpdate
from database.models.enums import UserRole
from src.core.exceptions import NotFoundException
from src.core.pagination import create_paginated_response
from src.core.audit import log_audit_event

class UserService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def get_user_profile(self, user_id: uuid.UUID) -> UserResponse:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundException(f"User with ID '{user_id}' not found")
        return UserResponse.model_validate(user)

    def update_user_profile(self, user_id: uuid.UUID, update_in: UserUpdate) -> UserResponse:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundException(f"User with ID '{user_id}' not found")
        
        update_data = update_in.model_dump(exclude_unset=True)
        updated_user = self.repo.update(user, update_data)
        log_audit_event("USER_PROFILE_UPDATED", resource_id=user.id)
        return UserResponse.model_validate(updated_user)

    def list_users(
        self, 
        page: int = 1, 
        limit: int = 10, 
        role: Optional[UserRole] = None, 
        search: Optional[str] = None
    ) -> Dict[str, Any]:
        skip = (page - 1) * limit
        users, total = self.repo.list_paginated(skip=skip, limit=limit, role=role, search=search)
        user_responses = [UserResponse.model_validate(u) for u in users]
        return create_paginated_response(user_responses, total, page, limit)
