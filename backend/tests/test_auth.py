import pytest
from uuid import uuid4
from app.core.security import get_password_hash, verify_password, create_access_token, decode_token

def test_password_hashing():
    pwd = "SecretPassword123!"
    hashed = get_password_hash(pwd)
    assert hashed != pwd
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_token_encoding_decoding():
    user_id = str(uuid4())
    role = "HEALTH_WORKER"
    token = create_access_token(subject=user_id, role=role)
    payload = decode_token(token)
    assert payload["sub"] == user_id
    assert payload["role"] == role
