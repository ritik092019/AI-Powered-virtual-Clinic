from fastapi import APIRouter, Depends, status, Header
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.schemas.user import UserCreate, UserLogin, UserResponse, TokenSchema, RefreshTokenSchema
from src.modules.auth.service import AuthService
from src.core.dependencies import get_current_user
from src.core.response import APIResponse
from database.models import User, UserRole

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Public self-registration for Patient, Health Worker, and Doctor accounts (Admin forbidden)."""
    service = AuthService(db)
    user = service.register(user_in, is_admin_creator=False)
    return APIResponse.created(data=user, message="User registered successfully")

@router.post("/register-admin", status_code=status.HTTP_201_CREATED)
def register_admin(
    user_in: UserCreate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Register a new Administrator account (restricted to existing Administrators)."""
    if current_user.role != UserRole.ADMIN:
        from src.core.exceptions import ForbiddenException
        raise ForbiddenException("Only active Administrators can create new Administrator accounts")
    
    service = AuthService(db)
    user_in.role = UserRole.ADMIN
    user = service.register(user_in, is_admin_creator=True)
    return APIResponse.created(data=user, message="Admin account created successfully")

@router.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user credentials and issue access + refresh JWT tokens."""
    service = AuthService(db)
    token_data = service.login(credentials)
    return APIResponse.success(data=token_data, message="Login successful")

@router.post("/refresh")
def refresh_token(refresh_in: RefreshTokenSchema, db: Session = Depends(get_db)):
    """Exchange a valid refresh token for a fresh access token."""
    service = AuthService(db)
    token_data = service.refresh_access_token(refresh_in.refresh_token)
    return APIResponse.success(data=token_data, message="Token refreshed successfully")

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """Invalidate current user session and logout."""
    return APIResponse.success(message="Logged out successfully")

@router.get("/me")
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current authenticated user profile contract."""
    user_response = UserResponse.model_validate(current_user)
    return APIResponse.success(data=user_response)
