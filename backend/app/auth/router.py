from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.users.schemas import UserCreate, UserLogin, UserResponse, RefreshTokenSchema
from app.auth.service import AuthService
from app.core.dependencies import get_current_user
from app.common.responses import APIResponse
from app.users.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new Health Worker, Doctor, or Administrator account."""
    service = AuthService(db)
    user = service.register(user_in)
    return APIResponse.created(data=user, message="User registered successfully")

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
