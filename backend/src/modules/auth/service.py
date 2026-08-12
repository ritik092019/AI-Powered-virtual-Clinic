from uuid import UUID
from sqlalchemy.orm import Session
from src.modules.auth.repository import AuthRepository
from src.schemas.user import UserCreate, UserLogin, UserResponse, TokenSchema, PasswordChangeSchema
from src.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from src.core.exceptions import ConflictException, UnauthorizedException, NotFoundException, BadRequestException
from src.core.audit import log_audit_event

class AuthService:
    def __init__(self, db: Session):
        self.repo = AuthRepository(db)

    def register(self, user_in: UserCreate) -> UserResponse:
        existing = self.repo.get_by_email(user_in.email)
        if existing:
            raise ConflictException(f"User with email '{user_in.email}' already exists")
        
        user_data = user_in.model_dump()
        user_data["password"] = get_password_hash(user_in.password)
        
        user = self.repo.create(user_data)
        log_audit_event("USER_REGISTERED", resource_id=user.id, details={"email": user.email, "role": user.role.value})
        return UserResponse.model_validate(user)

    def login(self, credentials: UserLogin) -> TokenSchema:
        user = self.repo.get_by_email(credentials.email)
        if not user or not verify_password(credentials.password, user.password):
            raise UnauthorizedException("Invalid email or password")
        
        access_token = create_access_token(subject=user.id, role=user.role.value)
        refresh_token = create_refresh_token(subject=user.id, role=user.role.value)
        user_resp = UserResponse.model_validate(user)
        log_audit_event("USER_LOGIN_SUCCESS", performed_by=user.id, details={"email": user.email})
        return TokenSchema(
            access_token=access_token, 
            refresh_token=refresh_token, 
            token_type="bearer", 
            user=user_resp
        )

    def refresh_access_token(self, refresh_token_str: str) -> TokenSchema:
        try:
            payload = decode_token(refresh_token_str)
            if payload.get("type") != "refresh":
                raise BadRequestException("Invalid token type. Refresh token required")
            user_id = UUID(payload.get("sub"))
        except Exception as e:
            raise UnauthorizedException(f"Invalid refresh token: {e}")

        user = self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundException("User account associated with refresh token not found")

        access_token = create_access_token(subject=user.id, role=user.role.value)
        new_refresh = create_refresh_token(subject=user.id, role=user.role.value)
        return TokenSchema(
            access_token=access_token, 
            refresh_token=new_refresh, 
            token_type="bearer", 
            user=UserResponse.model_validate(user)
        )

    def change_password(self, user_id: UUID, change_in: PasswordChangeSchema) -> dict:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundException("User not found")
        if not verify_password(change_in.old_password, user.password):
            raise BadRequestException("Incorrect current password")

        user.password = get_password_hash(change_in.new_password)
        self.repo.db.commit()
        log_audit_event("USER_PASSWORD_CHANGED", performed_by=user.id)
        return {"message": "Password changed successfully"}

    def get_current_user(self, user_id: UUID) -> UserResponse:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundException("User account not found")
        return UserResponse.model_validate(user)
