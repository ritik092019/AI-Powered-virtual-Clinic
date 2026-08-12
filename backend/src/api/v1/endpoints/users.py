from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.schemas.user import UserUpdate, PasswordChangeSchema
from src.modules.users.service import UserService
from src.modules.auth.service import AuthService
from src.core.dependencies import get_current_user, require_roles
from src.core.response import APIResponse
from database.models import User, UserRole

router = APIRouter(prefix="/users", tags=["User Management"])

@router.get("")
def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    role: Optional[UserRole] = Query(None, description="Filter users by role (DOCTOR, HEALTH_WORKER, ADMIN)"),
    search: Optional[str] = Query(None, description="Search by name or email"),
    current_user: User = Depends(require_roles([UserRole.HEALTH_WORKER, UserRole.DOCTOR, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Retrieve paginated list of users (e.g. Health Worker looking up Doctors available for assignment)."""
    service = UserService(db)
    result = service.list_users(page=page, limit=limit, role=role, search=search)
    return APIResponse.success(data=result["items"], meta=result["meta"])

@router.get("/{user_id}")
def get_user_profile(
    user_id: UUID, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user profile by UUID."""
    service = UserService(db)
    user = service.get_user_profile(user_id)
    return APIResponse.success(data=user)

@router.put("/me")
def update_current_user_profile(
    update_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile details."""
    service = UserService(db)
    updated = service.update_user_profile(current_user.id, update_in)
    return APIResponse.success(data=updated, message="Profile updated successfully")

@router.post("/change-password")
def change_password(
    change_in: PasswordChangeSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change current user's password."""
    service = AuthService(db)
    res = service.change_password(current_user.id, change_in)
    return APIResponse.success(message=res["message"])
