from typing import List, Optional
from uuid import UUID
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.common.exceptions import UnauthorizedException, ForbiddenException
from app.common.enums import UserRole
from app.users.models import User

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"/api/v1/auth/login",
    auto_error=False
)

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Dependency that verifies Bearer token and returns authenticated User."""
    if not token:
        raise UnauthorizedException("Authentication token required")
    
    try:
        payload = decode_token(token)
        user_id_str = payload.get("sub")
        if not user_id_str:
            raise UnauthorizedException("Invalid token payload")
        user_id = UUID(user_id_str)
    except Exception:
        raise UnauthorizedException("Invalid or expired authentication token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise UnauthorizedException("User account associated with token no longer exists")
    
    return user

def require_roles(allowed_roles: List[UserRole]):
    """Factory function for role-based authorization guards."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise ForbiddenException(
                f"Role '{current_user.role.value}' is not authorized to access this resource. Required: {[r.value for r in allowed_roles]}"
            )
        return current_user
    return role_checker

# Pre-defined convenience role guards
require_health_worker = require_roles([UserRole.HEALTH_WORKER, UserRole.ADMIN])
require_doctor = require_roles([UserRole.DOCTOR, UserRole.ADMIN])
require_admin = require_roles([UserRole.ADMIN])
require_any_authenticated_user = require_roles([UserRole.HEALTH_WORKER, UserRole.DOCTOR, UserRole.ADMIN])
