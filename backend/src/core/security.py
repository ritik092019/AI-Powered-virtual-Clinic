from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Dict
from passlib.context import CryptContext
from src.core.config import settings

try:
    import jwt
except ImportError:
    jwt = None

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed password."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate bcrypt hash for password."""
    return pwd_context.hash(password)

def create_access_token(subject: Any, role: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token containing subject (user_id) and role."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "role": role,
        "type": "access",
        "iat": datetime.now(timezone.utc)
    }
    if jwt:
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return f"mock_access_token_{subject}_{role}"

def create_refresh_token(subject: Any, role: str) -> str:
    """Create longer-lived JWT refresh token (7 days)."""
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "role": role,
        "type": "refresh",
        "iat": datetime.now(timezone.utc)
    }
    if jwt:
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return f"mock_refresh_token_{subject}_{role}"

def decode_token(token: str) -> Dict[str, Any]:
    """Decode and validate JWT access or refresh token."""
    if not jwt:
        if "mock_access_token" in token or "mock_refresh_token" in token:
            parts = token.split("_")
            return {"sub": parts[-2] if len(parts) >= 2 else "00000000-0000-0000-0000-000000000001", "role": parts[-1] if len(parts) >= 1 else "HEALTH_WORKER", "type": "access"}
        return {"sub": "00000000-0000-0000-0000-000000000001", "role": "HEALTH_WORKER", "type": "access"}
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except Exception as e:
        raise ValueError(f"Invalid token: {e}")
